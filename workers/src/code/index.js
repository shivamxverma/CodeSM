import { writeCodeToRunnerDir } from "./file-handler.js";
import { setSubmissionStatus } from "../../loaders/redis.js";
import {
  updateExecutionResult,
  fetchTestCases,
  noTestcasesFound,
} from "./db-service.js";
import { executeCode } from "./execute.js";

// ─── Main Execute ─────────────────────────────────────────────────────────────
/**
 * @param {string} code          - raw source code
 * @param {string} language      - e.g. 'cpp', 'python', 'java'
 * @param {string} problemId     - used to fetch testcases from DB
 * @param {string} submissionId  - used to update DB records
 * @param {{ timeLimit: number, memoryLimit: number }} limits
 * @param {'RUN' | 'SUBMIT'} mode
 *   RUN    → only sample (visible) testcases
 *   SUBMIT → all testcases
 */
const runCodeWithInput = async (
  code,
  language,
  problemId,
  submissionId,
  limits,
  mode = "SUBMIT",
) => {
  console.log(`[Worker] Starting ${mode} for submission ${submissionId}`);

  // Write source file to a temp directory on the host
  const { runnerDir } = await writeCodeToRunnerDir(code, language);
  console.log(`[Worker] Code written to ${runnerDir}`);

  // Build DB query based on mode
  const testcases = await fetchTestCases(problemId, mode);

  console.log(`[Worker] Fetched ${testcases.length} testcases (mode=${mode})`);

  if (testcases.length === 0) {
    return await noTestcasesFound(submissionId, runnerDir);
  }

  // Execute against testcases
  const result = await executeCode(testcases, language, runnerDir, limits);
  console.log(
    `[Worker] Done — verdict: ${result.verdict} (${result.passedCount}/${result.totalCount})`,
  );

  // Persist submission result
  await updateExecutionResult(submissionId, result);

  await setSubmissionStatus(submissionId, result.status);
  console.log(`[Worker] runCodeWithInput complete for ${submissionId}`);
  return result;
};

export default runCodeWithInput;
