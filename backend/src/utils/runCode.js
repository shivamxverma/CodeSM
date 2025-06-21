import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../services/aws.service.js';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const runnerDir = path.join(projectRoot, 'code');

const runCppCodeWithInput = async (cppCode, problemTitle) => {
  const problemName = problemTitle.replace(/\s+/g, '').toLowerCase();
  const codePath = path.join(runnerDir, 'user_code.cpp');

  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, cppCode);


  let testcases;
  try {
    testcases = await fetchTestcasesFromS3(problemName);
  } catch (err) {
    return { status: "testcase_fetch_error", error: err.message };
  }

  // try {
  //   await execAsync(`docker build -t cpp-runner .`, { cwd: projectRoot });
  // } catch (err) {
  //   return { status: 'builderror', error: err.stderr || err.message };
  // }

  const execution = await Promise.all(
    testcases.map(async ({ input, output }, index) => {
      const inputFile = path.join(runnerDir, `input_${index + 1}.txt`);
      await fs.writeFile(inputFile, input);

      try {
        const { stdout } = await execAsync(
          `docker run --rm -v ${runnerDir}:/app cpp-runner bash -c "timeout 2s ./user_program < input_${index + 1}.txt"`,
          { cwd: projectRoot }
        );

        const isPassed = stdout.trim() === output.trim();
        return {
          isPassed,
          output: stdout.trim(),
          testCaseNumber: `${index + 1}`,
        };

      } catch (err) {
        return {
          isPassed: false,
          output: err.stderr?.trim() || err.message || "Runtime Error",
          testCaseNumber: `${index + 1}`,
        };
      }
    })
  );

  const allPassed = execution.every(e => e.isPassed);

  return {
    status: allPassed ? "accepted" : "rejected",
    execution
  };
};

export default runCppCodeWithInput;
