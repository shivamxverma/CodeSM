import fs from "fs/promises";
import { normalizeOut, languageSpec } from "./language.js";
import {
  execAsync,
  shouldAutoBuildRunner,
  RUNNER_IMAGE,
  RUNNER_DOCKERFILE,
  RUNNER_BUILD_CONTEXT,
  projectRoot,
} from "./file-handler.js";
import {
  compileInContainer,
  startPersistentContainer,
  runTestcaseInContainer,
  stopContainer,
} from "./docker.js";
import { fetchTestcasesFromS3 } from "../services/aws.service.js";

/**
 * Compile once, spin up ONE persistent container,
 * run all testcases via docker exec, then tear down.
 */

async function ensureRunnerImage() {
  try {
    await execAsync(`docker image inspect ${JSON.stringify(RUNNER_IMAGE)}`, {
      cwd: projectRoot,
    });
    return;
  } catch {
    if (!shouldAutoBuildRunner()) {
      throw new Error(`Sandbox image ${RUNNER_IMAGE} is missing.`);
    }
    const buildCmd = [
      "docker",
      "build",
      "-f",
      RUNNER_DOCKERFILE,
      "-t",
      RUNNER_IMAGE,
      RUNNER_BUILD_CONTEXT,
    ];
    await execAsync(buildCmd.map((a) => JSON.stringify(a)).join(" "), {
      cwd: projectRoot,
    });
  }
}

export const executeCode = async (testcases, language, runnerDir, limits) => {
  const spec = languageSpec(language);
  const defaultCounts = {
    passedCount: 0,
    totalCount: testcases.length,
    totalTime: 0,
    maxMemory: 0,
  };

  if (!spec) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return {
      status: "COMPILE_ERROR",
      verdict: "COMPILE_ERROR",
      error: `Unsupported language: ${language}`,
      ...defaultCounts,
    };
  }

  // 1. Ensure Docker image exists
  try {
    await ensureRunnerImage();
  } catch (err) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return {
      status: "FAILED",
      verdict: "RUNTIME_ERROR",
      error: err.message,
      ...defaultCounts,
    };
  }

  // 2. Compile (skipped automatically for interpreted languages)
  const compile = await compileInContainer(runnerDir, spec);
  if (!compile.ok) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return {
      status: "COMPILE_ERROR",
      verdict: "COMPILE_ERROR",
      errors: compile.errors,
      raw: compile.raw,
      ...defaultCounts,
    };
  }

  // 3. Start ONE persistent container for all testcases
  let containerId;
  try {
    containerId = await startPersistentContainer(runnerDir);
  } catch (err) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return {
      status: "FAILED",
      verdict: "RUNTIME_ERROR",
      error: err.message,
      ...defaultCounts,
    };
  }

  let passedCount = 0;
  let totalTime = 0;
  let maxMemory = 0;
  let finalVerdict = "ACCEPTED";

  try {
    for (let i = 0; i < testcases.length; i++) {
      const tc = testcases[i];
      const s3Data = await fetchTestcasesFromS3(tc.s3Key);

      // S3 fetch failed
      if (!s3Data) {
        finalVerdict = "FAILED";
        break;
      }

      try {
        const result = await runTestcaseInContainer(
          containerId,
          spec,
          s3Data.input,
          limits.timeLimit,
        );

        totalTime += result.time;
        maxMemory = Math.max(maxMemory, result.memory ?? 0);

        if (normalizeOut(result.stdout) === normalizeOut(s3Data.output)) {
          passedCount++;
        } else {
          finalVerdict = "WRONG_ANSWER";
          break; // ← early exit: no point running remaining testcases
        }
      } catch (err) {
        totalTime += err.time || 0;

        if (err.message === "TLE") finalVerdict = "TIME_LIMIT_EXCEEDED";
        else if (err.message === "MLE") finalVerdict = "MEMORY_LIMIT_EXCEEDED";
        else finalVerdict = "RUNTIME_ERROR";

        break; // ← early exit on any execution error
      }
    }
  } finally {
    // Always stop the container — even if we threw or broke early
    await stopContainer(containerId);
    await fs.rm(runnerDir, { recursive: true, force: true });
  }

  return {
    status: "COMPLETED",
    verdict: finalVerdict,
    passedCount,
    totalCount: testcases.length,
    totalTime,
    maxMemory,
  };
};
