import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import {
  RUN_TIMEOUT_SEC,
  MAX_PROGRAM_OUTPUT_BYTES,
} from "../../utils/constants.js";
import { dockerResourceAndSecurityArgs } from "./language.js";
import { projectRoot, execAsync, RUNNER_IMAGE } from "./file-handler.js";

/**
 * Start a long-lived container that just sleeps.
 * We'll docker exec into it for each testcase.
 */
export async function startPersistentContainer(runnerDir) {
  const containerId = `runner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const args = [
    "run",
    "-d",
    "--name",
    containerId,
    ...dockerResourceAndSecurityArgs(),
    "--read-only",
    "--tmpfs",
    "/tmp:rw,nosuid,nodev,exec,size=64m",
    "-v",
    `${runnerDir}:/host_code:ro`,
    RUNNER_IMAGE,
    "sleep",
    "infinity", // keeps container alive between execs
  ];

  await execAsync(`docker ${args.join(" ")}`, { cwd: projectRoot });
  return containerId;
}

/**
 * Always call this — even on error paths — to avoid leaked containers.
 */
export async function stopContainer(containerId) {
  try {
    await execAsync(`docker stop ${containerId}`);
    await execAsync(`docker rm   ${containerId}`);
  } catch (err) {
    // best-effort: log but don't throw, cleanup shouldn't mask real errors
    console.error(
      `[Cleanup] Failed to stop container ${containerId}:`,
      err.message,
    );
  }
}

// ─── Per-Testcase Exec ────────────────────────────────────────────────────────

/**
 * docker exec into the already-running container and feed it one testcase.
 * ~5ms overhead vs ~300ms for a fresh docker run.
 */
export function runTestcaseInContainer(containerId, spec, input, timeLimit) {
  const tLimit = timeLimit || RUN_TIMEOUT_SEC;

  // Build bootstrap: copy artifacts from the read-only host_code mount into /tmp
  let bootstrap;
  if (spec.kind === "interpreted") {
    bootstrap = `cp /host_code/${spec.filename} /tmp/`;
  } else if (spec?.artifacts?.type === "class") {
    bootstrap = "cp /host_code/*.class /tmp/";
  } else {
    bootstrap =
      "cp /host_code/user_program /tmp/ && chmod +x /tmp/user_program";
  }

  // Replace the default timeout with the per-problem time limit
  const runCmd = spec.run.replace(
    `timeout ${RUN_TIMEOUT_SEC}s`,
    `timeout ${tLimit}s`,
  );

  // Clean /tmp state from previous testcase run, then re-bootstrap, then run
  const inner = [
    "cd /tmp",
    "rm -f /tmp/user_program /tmp/*.class /tmp/main.py /tmp/main.js", // clean prior state
    bootstrap,
    runCmd,
  ].join(" && ");

  return new Promise((resolve, reject) => {
    const args = [
      "exec",
      "-i", // -i keeps stdin open so we can pipe input
      containerId,
      "bash",
      "-lc",
      inner,
    ];

    const proc = spawn("docker", args, { cwd: projectRoot });
    let stdout = "";
    let stderr = "";
    let outBytes = 0;
    const startTime = Date.now();

    proc.stdout.on("data", (d) => {
      const s = d.toString();
      outBytes += Buffer.byteLength(s, "utf8");
      if (outBytes > MAX_PROGRAM_OUTPUT_BYTES) {
        proc.kill("SIGKILL");
        return;
      }
      stdout += s;
    });

    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    proc.on("error", (err) =>
      reject({ message: err.message, time: Date.now() - startTime }),
    );

    proc.on("close", (code) => {
      const duration = Date.now() - startTime;
      if (code === 0) resolve({ stdout: stdout.trim(), time: duration });
      else if (code === 124) reject({ message: "TLE", time: duration });
      else if (code === 137) reject({ message: "MLE", time: duration });
      else
        reject({
          message: (stderr || stdout || `Exited ${code}`).trim(),
          time: duration,
        });
    });

    proc.stdin.write(input ?? "");
    proc.stdin.end();
  });
}

export async function compileInContainer(runnerDir, spec) {
  // Interpreted languages skip compilation
  if (spec.kind === "interpreted") return { ok: true };

  const binPath = path.join(runnerDir, "user_program");
  const javaClassPath =
    spec?.artifacts?.type === "class"
      ? path.join(runnerDir, `${spec.artifacts.className}.class`)
      : null;

  await fs.rm(binPath, { force: true });
  if (javaClassPath) await fs.rm(javaClassPath, { force: true });

  const inner = [
    "cd /tmp &&",
    `cp /host_code/${spec.filename} . &&`,
    `${spec.compile} &&`,
    "cp /tmp/user_program /host_code/user_program 2>/dev/null || true;",
    "cp /tmp/*.class /host_code/ 2>/dev/null || true;",
    "cat /tmp/compile.err",
  ].join(" ");

  return new Promise((resolve) => {
    const args = [
      "run",
      "--rm",
      ...dockerResourceAndSecurityArgs(),
      "-v",
      `${runnerDir}:/host_code:rw`,
      RUNNER_IMAGE,
      "bash",
      "-lc",
      inner,
    ];

    const proc = spawn("docker", args, { cwd: projectRoot });
    let stderr = "";
    let stdout = "";
    let outBytes = 0;

    const onChunk = (buf, which) => {
      const s = buf.toString();
      outBytes += Buffer.byteLength(s, "utf8");
      if (outBytes > MAX_PROGRAM_OUTPUT_BYTES) {
        proc.kill("SIGKILL");
        return;
      }
      if (which === "stderr") stderr += s;
      else stdout += s;
    };

    proc.stdout.on("data", (d) => onChunk(d, "stdout"));
    proc.stderr.on("data", (d) => onChunk(d, "stderr"));

    proc.on("close", async () => {
      try {
        if (spec?.artifacts?.type === "class" && javaClassPath) {
          await fs.access(javaClassPath);
        } else {
          await fs.access(binPath);
        }
        resolve({ ok: true });
      } catch {
        const text = (stdout + "\n" + stderr).trim();
        resolve({
          ok: false,
          errors: [
            {
              file: spec.filename,
              line: 1,
              column: 1,
              severity: "error",
              message: text,
            },
          ],
          raw: text,
        });
      }
    });
  });
}
