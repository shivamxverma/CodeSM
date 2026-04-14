import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../services/aws.service.js';
import env from '../config/index.js';
import JobResult from '../models/jobresult.model.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

// Backwards compatible env var: CPP_RUNNER_IMAGE; prefer RUNNER_IMAGE for multi-lang sandbox.
const RUNNER_IMAGE =
  env.RUNNER_IMAGE ||
  env.CPP_RUNNER_IMAGE ||
  'codesm-sandbox-runner:latest';
const RUNNER_DOCKERFILE = path.join(projectRoot, 'docker', 'sandbox-runner', 'Dockerfile');
const RUNNER_BUILD_CONTEXT = path.join(projectRoot, 'docker', 'sandbox-runner');

/** In production, pre-pull the image (CI/registry). Auto-build only when explicitly allowed or non-production. */
function shouldAutoBuildRunner() {
  if (env.RUNNER_AUTO_BUILD === 'true') return true;
  if (env.RUNNER_AUTO_BUILD === 'false') return false;
  if (env.CPP_RUNNER_AUTO_BUILD === 'true') return true;
  if (env.CPP_RUNNER_AUTO_BUILD === 'false') return false;
  return env.NODE_ENV !== 'production';
}

function parsePositiveInt(name, fallback) {
  const v = parseInt(env[name] || String(fallback), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const SANDBOX_MEMORY = env.SANDBOX_MEMORY || '256m';
const SANDBOX_CPUS = env.SANDBOX_CPUS || '0.5';
const SANDBOX_PIDS_LIMIT = env.SANDBOX_PIDS_LIMIT || '64';
const COMPILE_TIMEOUT_SEC =
  parsePositiveInt('COMPILE_TIMEOUT_SEC', parsePositiveInt('CPP_COMPILE_TIMEOUT_SEC', 60));
const RUN_TIMEOUT_SEC =
  parsePositiveInt('RUN_TIMEOUT_SEC', parsePositiveInt('CPP_RUN_TIMEOUT_SEC', 2));
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

function normalizeLanguage(language) {
  const raw = String(language || '').toLowerCase().trim();
  if (raw === 'golang') return 'go';
  if (raw === 'js') return 'javascript';
  if (raw === 'py') return 'python';
  if (raw === 'c++') return 'cpp';
  return raw;
}

function languageSpec(language) {
  const lang = normalizeLanguage(language);
  /** @type {Record<string, {id:string, filename:string, kind:'compiled'|'interpreted', compile?:string, run:string, artifacts?: { type: 'binary', path: string } | { type: 'class', className: string } }>} */
  const specs = {
    cpp: {
      id: 'cpp',
      filename: 'main.cpp',
      kind: 'compiled',
      compile:
        `timeout ${COMPILE_TIMEOUT_SEC}s g++ main.cpp -O2 -std=c++17 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: 'binary', path: 'user_program' },
    },
    c: {
      id: 'c',
      filename: 'main.c',
      kind: 'compiled',
      compile:
        `timeout ${COMPILE_TIMEOUT_SEC}s gcc main.c -O2 -std=c11 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: 'binary', path: 'user_program' },
    },
    java: {
      id: 'java',
      filename: 'Main.java',
      kind: 'compiled',
      compile:
        `timeout ${COMPILE_TIMEOUT_SEC}s javac -J-Dfile.encoding=UTF-8 -encoding UTF-8 Main.java 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s java -Dfile.encoding=UTF-8 -cp /tmp Main`,
      artifacts: { type: 'class', className: 'Main' },
    },
    go: {
      id: 'go',
      filename: 'main.go',
      kind: 'compiled',
      compile:
        `timeout ${COMPILE_TIMEOUT_SEC}s bash -lc 'GOMODCACHE=/tmp/gomodcache GOPATH=/tmp/gopath GOCACHE=/tmp/gocache go build -o user_program main.go' 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: 'binary', path: 'user_program' },
    },
    python: {
      id: 'python',
      filename: 'main.py',
      kind: 'interpreted',
      run: `timeout ${RUN_TIMEOUT_SEC}s python3 -B main.py`,
    },
    javascript: {
      id: 'javascript',
      filename: 'main.js',
      kind: 'interpreted',
      run: `timeout ${RUN_TIMEOUT_SEC}s node main.js`,
    },
  };
  return specs[lang] || null;
}

const writeCodeToRunnerDir = async (code, language) => {
  const runnerDir = path.join(projectRoot, 'code');
  const spec = languageSpec(language);
  if (!spec) throw new Error(`Unsupported language: ${language}`);
  const codePath = path.join(runnerDir, spec.filename);

  await fs.mkdir(runnerDir, { recursive: true });
  await fs.writeFile(codePath, code);
  return { runnerDir, codePath, spec };
};

async function ensureRunnerImage() {
  try {
    await execAsync(`docker image inspect ${JSON.stringify(RUNNER_IMAGE)}`, { cwd: projectRoot });
    return;
  } catch {
    if (!shouldAutoBuildRunner()) {
      throw new Error(
        `Sandbox image ${RUNNER_IMAGE} is missing. Pre-build or pull it, or set RUNNER_AUTO_BUILD=true (not recommended in production).`
      );
    }
    const buildCmd = [
      'docker',
      'build',
      '-f',
      RUNNER_DOCKERFILE,
      '-t',
      RUNNER_IMAGE,
      RUNNER_BUILD_CONTEXT,
    ];
    await execAsync(buildCmd.map((a) => JSON.stringify(a)).join(' '), { cwd: projectRoot });
  }
}

async function compileInContainer(runnerDir, spec) {
  const binPath = path.join(runnerDir, 'user_program');
  const javaClassPath =
    spec?.artifacts?.type === 'class'
      ? path.join(runnerDir, `${spec.artifacts.className}.class`)
      : null;

  await fs.rm(binPath, { force: true });
  if (javaClassPath) await fs.rm(javaClassPath, { force: true });
  const innerCompile = spec.compile
    ? spec.compile
    : `bash -lc 'echo "no compile" >/dev/null'`;
  const inner = [
    'cd /tmp &&',
    `cp /host_code/${spec.filename} . &&`,
    `${innerCompile} &&`,
    'cp /tmp/user_program /host_code/user_program 2>/dev/null || true;',
    'cp /tmp/*.class /host_code/ 2>/dev/null || true;',
    'cat /tmp/compile.err',
  ].join(' ');

  return new Promise((resolve) => {
    const args = [
      'run', '--rm',
      ...dockerResourceAndSecurityArgs(),
      '-v', `${runnerDir}:/host_code:rw`,
      RUNNER_IMAGE,
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
        if (spec.kind === 'interpreted') {
          resolve({ ok: true });
          return;
        }
        if (spec?.artifacts?.type === 'class' && javaClassPath) {
          await fs.access(javaClassPath);
          resolve({ ok: true });
          return;
        }
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
          errors: diag.length ? diag : [{ file: spec.filename, line: 1, column: 1, severity: 'error', message: text }],
          raw: text,
        });
      }
    });
  });
}

/** Run one testcase with stdin. */
function runInContainer(runnerDir, spec, input) {
  const inputStr = input ?? '';
  if (Buffer.byteLength(inputStr, 'utf8') > MAX_TESTCASE_INPUT_BYTES) {
    return Promise.reject(new Error(`Input exceeds ${MAX_TESTCASE_INPUT_BYTES} bytes`));
  }

  const bootstrap =
    spec.kind === 'compiled'
      ? spec?.artifacts?.type === 'class'
        ? 'cp /host_code/*.class . 2>/dev/null || true'
        : 'cp /host_code/user_program . && chmod +x user_program'
      : `cp /host_code/${spec.filename} .`;
  const inner = [
    'cd /tmp &&',
    `${bootstrap} &&`,
    spec.run,
  ].join(' ');

  return new Promise((resolve, reject) => {
    const args = [
      'run', '--rm', '-i',
      ...dockerResourceAndSecurityArgs(),
      '--read-only',
      '--tmpfs', '/tmp:rw,nosuid,nodev,exec,size=64m',
      '-v', `${runnerDir}:/host_code:ro`,
      RUNNER_IMAGE,
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

  const spec = languageSpec(language);
  if (!spec) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'builderror', error: `Unsupported language: ${language}` };
  }

  try {
    await ensureRunnerImage();
  } catch (err) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'builderror', error: err.stderr || err.message };
  }

  const compile = await compileInContainer(runnerDir, spec);
  if (!compile.ok) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'compile_error', errors: compile.errors, raw: compile.raw };
  }

  const execution = [];
  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const expectedNorm = normalizeOut(tc.output);
    try {
      const actual = await runInContainer(runnerDir, spec, tc.input);
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

const runCodeWithInput = async (code, language, problemId, submissionId) => {
  const { runnerDir } = await writeCodeToRunnerDir(code, language);
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

const dryRunCodeWithInput = async (code, language, problem) => {
  const { runnerDir } = await writeCodeToRunnerDir(code, language);
  const testcases = problem.sampleTestcases;
  if (!testcases || testcases.length === 0) {
    return { status: 'no_sample_testcases', error: 'No sample testcases provided for dry run.' };
  }
  return await executeCode(testcases, language, runnerDir);
};

export { dryRunCodeWithInput };
export default runCodeWithInput;
