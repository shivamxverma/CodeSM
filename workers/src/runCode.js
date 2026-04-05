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

const CPP_RUNNER_IMAGE = process.env.CPP_RUNNER_IMAGE || 'codesm-cpp-runner:latest';
const CPP_RUNNER_DOCKERFILE = path.join(projectRoot, 'docker', 'cpp-runner', 'Dockerfile');
const CPP_RUNNER_BUILD_CONTEXT = path.join(projectRoot, 'docker', 'cpp-runner');

/** In production, pre-pull the image (CI/registry). Auto-build only when explicitly allowed or non-production. */
function shouldAutoBuildCppRunner() {
  if (process.env.CPP_RUNNER_AUTO_BUILD === 'true') return true;
  if (process.env.CPP_RUNNER_AUTO_BUILD === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

function parsePositiveInt(name, fallback) {
  const v = parseInt(process.env[name] || String(fallback), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const SANDBOX_MEMORY = process.env.SANDBOX_MEMORY || '256m';
const SANDBOX_CPUS = process.env.SANDBOX_CPUS || '0.5';
const SANDBOX_PIDS_LIMIT = process.env.SANDBOX_PIDS_LIMIT || '64';
const COMPILE_TIMEOUT_SEC = parsePositiveInt('CPP_COMPILE_TIMEOUT_SEC', 60);
const RUN_TIMEOUT_SEC = parsePositiveInt('CPP_RUN_TIMEOUT_SEC', 2);
const MAX_TESTCASE_INPUT_BYTES = parsePositiveInt('MAX_TESTCASE_INPUT_BYTES', 256 * 1024);
const MAX_PROGRAM_OUTPUT_BYTES = parsePositiveInt('MAX_PROGRAM_OUTPUT_BYTES', 256 * 1024);

function dockerUserArgs() {
  if (process.platform === 'win32') return [];
  const uid = typeof process.getuid === 'function' ? process.getuid() : undefined;
  const gid = typeof process.getgid === 'function' ? process.getgid() : undefined;
  if (typeof uid === 'number' && typeof gid === 'number') {
    return ['--user', `${uid}:${gid}`];
  }
  return [];
}

/** Shared cgroup / isolation flags for compile and run sandboxes. */
function dockerResourceAndSecurityArgs() {
  return [
    '--memory', SANDBOX_MEMORY,
    '--memory-swap', SANDBOX_MEMORY,
    '--cpus', SANDBOX_CPUS,
    '--pids-limit', SANDBOX_PIDS_LIMIT,
    '--network', 'none',
    '--security-opt', 'no-new-privileges:true',
    '--cap-drop', 'ALL',
    '--stop-timeout', '5',
    ...dockerUserArgs(),
  ];
}

const returnFilePath = async (cppCode) => {
  const runnerDir = path.join(projectRoot, 'code');
  const codePath = path.join(runnerDir, 'user_code.cpp');

  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, cppCode);
  return { runnerDir, codePath };
};

async function ensureCppRunnerImage(language) {
  if (language !== 'cpp') return;
  try {
    await execAsync(`docker image inspect ${JSON.stringify(CPP_RUNNER_IMAGE)}`, { cwd: projectRoot });
    return;
  } catch {
    if (!shouldAutoBuildCppRunner()) {
      throw new Error(
        `Sandbox image ${CPP_RUNNER_IMAGE} is missing. Pre-build or pull it, or set CPP_RUNNER_AUTO_BUILD=true (not recommended in production).`
      );
    }
    const buildCmd = [
      'docker',
      'build',
      '-f',
      CPP_RUNNER_DOCKERFILE,
      '-t',
      CPP_RUNNER_IMAGE,
      CPP_RUNNER_BUILD_CONTEXT,
    ];
    await execAsync(buildCmd.map((a) => JSON.stringify(a)).join(' '), { cwd: projectRoot });
  }
}

async function compileInContainer(runnerDir) {
  const binPath = path.join(runnerDir, 'user_program');
  await fs.rm(binPath, { force: true });
  const inner = [
    'cd /tmp && cp /host_code/user_code.cpp . &&',
    `timeout ${COMPILE_TIMEOUT_SEC}s g++ user_code.cpp -O2 -std=c++17 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err &&`,
    'cp /tmp/user_program /host_code/user_program || true;',
    'cat /tmp/compile.err',
  ].join(' ');

  return new Promise((resolve) => {
    const args = [
      'run', '--rm',
      ...dockerResourceAndSecurityArgs(),
      '-v', `${runnerDir}:/host_code:rw`,
      CPP_RUNNER_IMAGE,
      'bash', '-lc', inner,
    ];
    const proc = spawn('docker', args, { cwd: projectRoot });
    let stderr = '';
    let stdout = '';
    let outBytes = 0;
    const onChunk = (buf, which) => {
      const s = buf.toString();
      outBytes += Buffer.byteLength(s, 'utf8');
      if (outBytes > MAX_PROGRAM_OUTPUT_BYTES) {
        proc.kill('SIGKILL');
        return;
      }
      if (which === 'stderr') stderr += s;
      else stdout += s;
    };
    proc.stdout.on('data', (d) => onChunk(d, 'stdout'));
    proc.stderr.on('data', (d) => onChunk(d, 'stderr'));
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
            message: m.groups.msg.trim(),
          });
        }
        resolve({
          ok: false,
          errors: diag.length ? diag : [{ file: 'user_code.cpp', line: 1, column: 1, severity: 'error', message: text }],
          raw: text,
        });
      }
    });
  });
}

/** Run the compiled binary once with the given stdin (one testcase). */
function runBinaryInContainer(runnerDir, input) {
  const inputStr = input ?? '';
  if (Buffer.byteLength(inputStr, 'utf8') > MAX_TESTCASE_INPUT_BYTES) {
    return Promise.reject(new Error(`Input exceeds ${MAX_TESTCASE_INPUT_BYTES} bytes`));
  }

  const inner = [
    'cd /tmp &&',
    'cp /host_code/user_program . && chmod +x user_program &&',
    `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
  ].join(' ');

  return new Promise((resolve, reject) => {
    const args = [
      'run', '--rm', '-i',
      ...dockerResourceAndSecurityArgs(),
      '--read-only',
      '--tmpfs', '/tmp:rw,nosuid,nodev,exec,size=64m',
      '-v', `${runnerDir}:/host_code:ro`,
      CPP_RUNNER_IMAGE,
      'bash', '-lc', inner,
    ];
    const proc = spawn('docker', args, { cwd: projectRoot });
    let stdout = '';
    let stderr = '';
    let outBytes = 0;
    const onChunk = (buf, which) => {
      const s = buf.toString();
      outBytes += Buffer.byteLength(s, 'utf8');
      if (outBytes > MAX_PROGRAM_OUTPUT_BYTES) {
        proc.kill('SIGKILL');
        return;
      }
      if (which === 'stderr') stderr += s;
      else stdout += s;
    };
    proc.stdout.on('data', (d) => onChunk(d, 'stdout'));
    proc.stderr.on('data', (d) => onChunk(d, 'stderr'));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error((stderr || stdout || `Exited ${code}`).trim()));
    });
    proc.stdin.write(inputStr);
    proc.stdin.end();
  });
}

const normalizeOut = (s) => (s ?? '').toString().replace(/\r\n/g, '\n').trim();

const executeCode = async (testcases, language, runnerDir) => {
  const cases = Array.isArray(testcases) ? testcases : testcases?.testcases;
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
        error: err.message,
      });
    }
  }

  await fs.rm(runnerDir, { recursive: true, force: true });
  console.log('Here execution ', execution);
  return { status: execution.every((r) => r.isPassed) ? 'accepted' : 'rejected', execution };
};

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
    executionTime: result.execution.reduce((acc, curr) => acc + (curr.executionTime ?? 0), 0),
    memoryUsage: result.execution.reduce((acc, curr) => acc + (curr.memoryUsage ?? 0), 0),
  });
  return result;
};

const dryRunCppCodeWithInput = async (cppCode, language, problem) => {
  const { runnerDir } = await returnFilePath(cppCode);
  const testcases = problem.sampleTestcases;
  if (!testcases || testcases.length === 0) {
    return { status: 'no_sample_testcases', error: 'No sample testcases provided for dry run.' };
  }
  return await executeCode(testcases, language, runnerDir);
};

export { dryRunCppCodeWithInput };
export default runCppCodeWithInput;
