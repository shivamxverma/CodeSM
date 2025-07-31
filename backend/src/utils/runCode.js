import { exec } from 'child_process';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../../services/aws.service.js';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const runnerDir   = path.join(projectRoot, 'backend', 'code');    // ← here
const codePath    = path.join(runnerDir, 'user_code.cpp');

async function buildDockerImage() {
  await execAsync('docker build -t cpp-runner .', { cwd: projectRoot });
}

function runTestInContainer(input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('docker', [
      'run', '--rm', '-i',
      '-v', `${runnerDir}:/host_code:ro`,
      'cpp-runner',
      'bash', '-c',
        [
          'cp /host_code/user_code.cpp /tmp',
          'cd /tmp',
          'g++ user_code.cpp -O2 -std=c++17 -o user_program',
          'timeout 2s ./user_program'
        ].join(' && ')
    ], { cwd: projectRoot });

    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);

    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else            reject(new Error(stderr.trim() || `Exited ${code}`));
    });

    proc.stdin.write(input);
    proc.stdin.end();
  });
}

const runCppCodeWithInput = async (cppCode, problemTitle) => {
  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, cppCode);

  let testcases;
  try {
    testcases = await fetchTestcasesFromS3(
      problemTitle.replace(/\s+/g, '').toLowerCase()
    );
  } catch (err) {
    return { status: 'testcase_fetch_error', error: err.message };
  }

  try {
    await buildDockerImage();
  } catch (err) {
    return { status: 'builderror', error: err.stderr || err.message };
  }

  const execution = [];
  for (let i = 0; i < testcases.length; i++) {
    const { input, output } = testcases[i];
    try {
      const actual = await runTestInContainer(input);
      execution.push({
        testCaseNumber: `${i + 1}`,
        isPassed: actual === output.trim(),
        output: actual
      });
    } catch (err) {
      execution.push({
        testCaseNumber: `${i + 1}`,
        isPassed: false,
        output: err.message
      });
    }
  }

  return {
    status: execution.every(r => r.isPassed) ? 'accepted' : 'rejected',
    execution
  };
};

export default runCppCodeWithInput;
