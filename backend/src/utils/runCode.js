import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../../services/aws.service.js';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const runnerDir = path.join(projectRoot, 'code');
const codePath = path.join(runnerDir, 'user_code.cpp');
const binPath = path.join(runnerDir, 'user_program');

async function buildDockerImage() {
  await execAsync('docker build -t cpp-runner .', { cwd: projectRoot });
}

async function compileInContainer() {
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

function runBinaryInContainer(input) {
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

const runCppCodeWithInput = async (cppCode, problem, dryRun) => {
  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, cppCode);

  console.log("Running C++ code with input for problem:", problem._id, "Dry run:", dryRun);

  let testcases;
  if (dryRun) {
    if (problem.sampleTestcases && problem.sampleTestcases.length > 0) {
      testcases = problem.sampleTestcases.map((tc, index) => ({
        input: tc.input,
        output: tc.output,
        testCaseNumber: `${index + 1}`
      }));
    } else {

      return { status: 'no_sample_testcases', error: 'No sample testcases provided for dry run.' };
    }
  } else {
    try {
      testcases = await fetchTestcasesFromS3(problem._id);
    } catch (err) {
      return { status: 'testcase_fetch_error', error: err.message };
    }
  }

  try {
    await buildDockerImage();
  } catch (err) {
    return { status: 'builderror', error: err.stderr || err.message };
  }

  const compile = await compileInContainer();
  if (!compile.ok) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'compile_error', errors: compile.errors, raw: compile.raw };
  }

  const execution = [];
  for (let i = 0; i < testcases.length; i++) {
    const { input, output } = testcases[i];
    try {
      const actual = await runBinaryInContainer(input);
      execution.push({ testCaseNumber: `${i + 1}`, isPassed: actual === String(output).trim(), output: actual });
    } catch (err) {
      execution.push({ testCaseNumber: `${i + 1}`, isPassed: false, output: err.message });
    }
  }

  await fs.rm(runnerDir, { recursive: true, force: true });
  return { status: execution.every(r => r.isPassed) ? 'accepted' : 'rejected', execution };
};

export default runCppCodeWithInput;
