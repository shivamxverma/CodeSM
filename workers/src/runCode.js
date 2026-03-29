import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../services/aws.service.js';
import dotenv from 'dotenv';
import JobResult from '../models/jobresult.model.js';

dotenv.config();
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

const returnFilePath = async (cppCode) => {
  const runnerDir = path.join(projectRoot, 'code');
  const codePath = path.join(runnerDir, 'user_code.cpp');

  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, cppCode);
  return { runnerDir, codePath };
};

/** Build cpp-runner only if missing — avoids paying `docker build` on every submission. */
async function ensureCppRunnerImage(language) {
  if (language !== 'cpp') return;
  try {
    await execAsync('docker image inspect cpp-runner', { cwd: projectRoot });
  } catch {
    await execAsync('docker build -t cpp-runner .', { cwd: projectRoot });
  }
}

async function compileInContainer(runnerDir) {
  const binPath = path.join(runnerDir, 'user_program');
  await fs.rm(binPath, { force: true });
  return new Promise((resolve) => {
    const args = [
      'run', '--rm',
      '-v', `${runnerDir}:/host_code:rw`,
      'cpp-runner',
      'bash', '-lc',
      `cd /tmp && cp /host_code/user_code.cpp . && g++ user_code.cpp -O2 -std=c++17 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err && cp /tmp/user_program /host_code/user_program || true; cat /tmp/compile.err`
    ];
    const proc = spawn('docker', args, { cwd: projectRoot });
    let stderr = '', stdout = '';
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', async () => {
      try {
        await fs.access(binPath);
        resolve({ ok: true });
      } catch {
        const text = (stdout + '\n' + stderr).trim();
        const diag = [];
        const re = /^(?<file>[^:\n]+):(?<line>\d+):(?<col>\d+):\s(?<sev>error|warning|note):\s(?<msg>[^\n]+)/gim;
        let m;
        while ((m = re.exec(text)) !== null) {
          diag.push({
            file: m.groups.file,
            line: parseInt(m.groups.line, 10),
            column: parseInt(m.groups.col, 10),
            severity: m.groups.sev,
            message: m.groups.msg.trim()
          });
        }
        resolve({
          ok: false,
          errors: diag.length ? diag : [{ file: 'user_code.cpp', line: 1, column: 1, severity: 'error', message: text }],
          raw: text
        });
      }
    });
  });
}

/** Run the compiled binary once with the given stdin (one testcase). */
function runBinaryInContainer(runnerDir, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'docker',
      [
        'run', '--rm', '-i',
        '--memory=256m', '--cpus=0.5', '--pids-limit=100',
        '-v', `${runnerDir}:/host_code:ro`,
        'cpp-runner',
        'bash', '-lc',
        `cd /tmp && cp /host_code/user_program . && timeout 2s ./user_program`
      ],
      { cwd: projectRoot }
    );
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error((stderr || stdout || `Exited ${code}`).trim()));
    });
    proc.stdin.write(input ?? '');
    proc.stdin.end();
  });
}

const normalizeOut = (s) => (s ?? '').toString().replace(/\r\n/g, '\n').trim();

const executeCode = async (testcases, language, runnerDir) => {
  const cases = Array.isArray(testcases)
    ? testcases
    : testcases?.testcases;
  if (!Array.isArray(cases) || cases.length === 0) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'testcase_fetch_error', error: 'Missing or invalid testcases' };
  }

  try {
    await ensureCppRunnerImage(language);
  } catch (err) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'builderror', error: err.stderr || err.message };
  }

  const compile = await compileInContainer(runnerDir);
  if (!compile.ok) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'compile_error', errors: compile.errors, raw: compile.raw };
  }

  const execution = [];
  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const expectedNorm = normalizeOut(tc.output);
    try {
      const actual = await runBinaryInContainer(runnerDir, tc.input);
      const isPassed = normalizeOut(actual) === expectedNorm;
      execution.push({ index: i, isPassed, input: tc.input, expected: tc.output, actual });
    } catch (err) {
      execution.push({
        index: i,
        isPassed: false,
        input: tc.input,
        expected: tc.output,
        error: err.message
      });
    }
  }

  await fs.rm(runnerDir, { recursive: true, force: true });
  return { status: execution.every(r => r.isPassed) ? 'accepted' : 'rejected', execution };
}

const runCppCodeWithInput = async (cppCode, language, problemId, submissionId) => {
  const { runnerDir } = await returnFilePath(cppCode);
  let testcases;
  try {
    testcases = await fetchTestcasesFromS3(problemId);
  } catch (err) {
    return { status: 'testcase_fetch_error', error: err.message };
  }
  const result = await executeCode(testcases, language, runnerDir);
  await JobResult.create({
    submissionId: submissionId,
    status: result.status === 'accepted' ? 'accepted' : 'rejected',
    output: JSON.stringify(result.execution),
    executionTime: result.execution.reduce(
      (acc, curr) => acc + (curr.executionTime ?? 0),
      0
    ),
    memoryUsage: result.execution.reduce(
      (acc, curr) => acc + (curr.memoryUsage ?? 0),
      0
    ),
  });
};

const dryRunCppCodeWithInput = async (cppCode, language, problem) => {
  const { runnerDir } = await returnFilePath(cppCode);
  const testcases = problem.sampleTestcases;
  if (!testcases || testcases.length === 0) {
    return { status: 'no_sample_testcases', error: 'No sample testcases provided for dry run.' };
  }
  return executeCode(testcases, language, runnerDir);
};

export { dryRunCppCodeWithInput };
export default runCppCodeWithInput;
