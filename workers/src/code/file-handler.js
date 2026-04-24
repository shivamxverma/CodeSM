import env from "../../config/index.js";
import { fileURLToPath } from "url";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { languageSpec } from "./language.js";
import { exec } from "child_process";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

const RUNNER_IMAGE =
  env.RUNNER_IMAGE || env.CPP_RUNNER_IMAGE || "codesm-sandbox-runner:latest";
const RUNNER_DOCKERFILE = path.join(
  projectRoot,
  "docker",
  "sandbox-runner",
  "Dockerfile",
);
const RUNNER_BUILD_CONTEXT = path.join(projectRoot, "docker", "sandbox-runner");

// ─── Config ───────────────────────────────────────────────────────────────────

function shouldAutoBuildRunner() {
  return env.RUNNER_AUTO_BUILD === "true" || env.RUNNER_AUTO_BUILD === "false"
    ? env.RUNNER_AUTO_BUILD === "true"
    : env.NODE_ENV !== "production";
}

export const writeCodeToRunnerDir = async (code, language) => {
  const runnerDir = path.join(
    projectRoot,
    "code",
    `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const spec = languageSpec(language);
  if (!spec) throw new Error(`Unsupported language: ${language}`);
  const codePath = path.join(runnerDir, spec.filename);

  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, code);
  return { runnerDir, codePath, spec };
};

export {
  execAsync,
  projectRoot,
  RUNNER_IMAGE,
  RUNNER_DOCKERFILE,
  RUNNER_BUILD_CONTEXT,
  shouldAutoBuildRunner,
};
