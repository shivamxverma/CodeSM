import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchTestcasesFromS3 } from '../services/aws.service.js';
import env from '../config/index.js';
import { db } from '../loaders/postgres.js';
import { schema } from 'db-schema';
import { eq, and } from 'drizzle-orm';
import { setSubmissionStatus } from './redis.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

const RUNNER_IMAGE = env.RUNNER_IMAGE || env.CPP_RUNNER_IMAGE || 'codesm-sandbox-runner:latest';
const RUNNER_DOCKERFILE = path.join(projectRoot, 'docker', 'sandbox-runner', 'Dockerfile');
const RUNNER_BUILD_CONTEXT = path.join(projectRoot, 'docker', 'sandbox-runner');

function shouldAutoBuildRunner() {
  if (env.RUNNER_AUTO_BUILD === 'true') return true;
  if (env.RUNNER_AUTO_BUILD === 'false') return false;
  return env.NODE_ENV !== 'production';
}

function parsePositiveInt(name, fallback) {
  const v = parseInt(env[name] || String(fallback), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const SANDBOX_MEMORY = env.SANDBOX_MEMORY || '256m';
const SANDBOX_CPUS = env.SANDBOX_CPUS || '0.5';
const SANDBOX_PIDS_LIMIT = env.SANDBOX_PIDS_LIMIT || '64';
const COMPILE_TIMEOUT_SEC = parsePositiveInt('COMPILE_TIMEOUT_SEC', 60);
const RUN_TIMEOUT_SEC = parsePositiveInt('RUN_TIMEOUT_SEC', 2);
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
  const specs = {
    cpp: {
      id: 'cpp',
      filename: 'main.cpp',
      kind: 'compiled',
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s g++ main.cpp -O2 -std=c++17 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: 'binary', path: 'user_program' },
    },
    c: {
      id: 'c',
      filename: 'main.c',
      kind: 'compiled',
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s gcc main.c -O2 -std=c11 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: 'binary', path: 'user_program' },
    },
    java: {
      id: 'java',
      filename: 'Main.java',
      kind: 'compiled',
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s javac -J-Dfile.encoding=UTF-8 -encoding UTF-8 Main.java 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s java -Dfile.encoding=UTF-8 -cp /tmp Main`,
      artifacts: { type: 'class', className: 'Main' },
    },
    go: {
      id: 'go',
      filename: 'main.go',
      kind: 'compiled',
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s bash -lc 'GOMODCACHE=/tmp/gomodcache GOPATH=/tmp/gopath GOCACHE=/tmp/gocache go build -o user_program main.go' 2> /tmp/compile.err`,
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
  const runnerDir = path.join(projectRoot, 'code', `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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
      throw new Error(`Sandbox image ${RUNNER_IMAGE} is missing.`);
    }
    const buildCmd = ['docker', 'build', '-f', RUNNER_DOCKERFILE, '-t', RUNNER_IMAGE, RUNNER_BUILD_CONTEXT];
    await execAsync(buildCmd.map((a) => JSON.stringify(a)).join(' '), { cwd: projectRoot });
  }
}

async function compileInContainer(runnerDir, spec) {
  const binPath = path.join(runnerDir, 'user_program');
  const javaClassPath = spec?.artifacts?.type === 'class' ? path.join(runnerDir, `${spec.artifacts.className}.class`) : null;

  await fs.rm(binPath, { force: true });
  if (javaClassPath) await fs.rm(javaClassPath, { force: true });
  const innerCompile = spec.compile ? spec.compile : `bash -lc 'echo "no compile" >/dev/null'`;
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
        resolve({ ok: false, errors: [{ file: spec.filename, line: 1, column: 1, severity: 'error', message: text }], raw: text });
      }
    });
  });
}

function runInContainer(runnerDir, spec, input, timeLimit, memoryLimit) {
  const inputStr = input ?? '';
  const tLimit = timeLimit || RUN_TIMEOUT_SEC;
  const mLimit = memoryLimit ? `${memoryLimit}m` : SANDBOX_MEMORY;

  const bootstrap = spec.kind === 'compiled'
    ? spec?.artifacts?.type === 'class'
      ? 'cp /host_code/*.class . 2>/dev/null || true'
      : 'cp /host_code/user_program . && chmod +x user_program'
    : `cp /host_code/${spec.filename} .`;

  const runCmd = spec.run.replace(`timeout ${RUN_TIMEOUT_SEC}s`, `timeout ${tLimit}s`);
  const inner = ['cd /tmp &&', `${bootstrap} &&`, runCmd].join(' ');

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const args = [
      'run', '--rm', '-i',
      ...dockerResourceAndSecurityArgs(),
      '--memory', mLimit,
      '--memory-swap', mLimit,
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
    proc.stdout.on('data', (d) => {
      const s = d.toString();
      outBytes += Buffer.byteLength(s, 'utf8');
      if (outBytes > MAX_PROGRAM_OUTPUT_BYTES) { proc.kill('SIGKILL'); return; }
      stdout += s;
    });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      const duration = Date.now() - startTime;
      if (code === 0) resolve({ stdout: stdout.trim(), time: duration, memory: memoryLimit || 0 });
      else if (code === 124) reject({ message: 'TLE', time: duration });
      else if (code === 137) reject({ message: 'MLE', time: duration });
      else reject({ message: (stderr || stdout || `Exited ${code}`).trim(), time: duration });
    });
    proc.stdin.write(inputStr);
    proc.stdin.end();
  });
}

const normalizeOut = (s) => (s ?? '').toString().replace(/\r\n/g, '\n').trim();

const executeCode = async (testcases, language, runnerDir, submissionId, limits) => {
  const spec = languageSpec(language);
  if (!spec) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'COMPILE_ERROR', error: `Unsupported language: ${language}` };
  }

  try { await ensureRunnerImage(); } catch (err) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'FAILED', error: err.message };
  }

  const compile = await compileInContainer(runnerDir, spec);
  if (!compile.ok) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    return { status: 'COMPILE_ERROR', raw: compile.raw };
  }

  let passedCount = 0;
  let totalTime = 0;
  let maxMemory = 0;
  let finalVerdict = 'ACCEPTED';

  for (let i = 0; i < testcases.length; i++) {
    const tc = testcases[i];
    const s3Data = await fetchTestcasesFromS3(tc.s3Key);
    if (!s3Data) {
      finalVerdict = 'FAILED';
      break;
    }

    try {
      const runResult = await runInContainer(runnerDir, spec, s3Data.input, limits.timeLimit, limits.memoryLimit);
      totalTime += runResult.time;
      maxMemory = Math.max(maxMemory, runResult.memory);

      if (normalizeOut(runResult.stdout) === normalizeOut(s3Data.output)) {
        passedCount++;
      } else {
        if (finalVerdict === 'ACCEPTED') finalVerdict = 'WRONG_ANSWER';
      }
    } catch (err) {
      totalTime += (err.time || 0);
      if (finalVerdict === 'ACCEPTED') {
        if (err.message === 'TLE') finalVerdict = 'TIME_LIMIT_EXCEEDED';
        else if (err.message === 'MLE') finalVerdict = 'MEMORY_LIMIT_EXCEEDED';
        else finalVerdict = 'RUNTIME_ERROR';
      }
    }
  }

  await fs.rm(runnerDir, { recursive: true, force: true });
  return { 
    status: finalVerdict === 'ACCEPTED' ? 'COMPLETED' : 'COMPLETED', // Status is COMPLETED if execution finished
    verdict: finalVerdict,
    passedCount,
    totalCount: testcases.length,
    totalTime,
    maxMemory
  };
};

const runCodeWithInput = async (code, language, problemId, submissionId, mode, limits) => {
  const { runnerDir } = await writeCodeToRunnerDir(code, language);
  
  // 1. Fetch testcase keys from database
  const testcaseQuery = mode === 'RUN' 
    ? and(eq(schema.testcase.problemId, problemId), eq(schema.testcase.isSample, true))
    : eq(schema.testcase.problemId, problemId);

  const testcases = await db
    .select()
    .from(schema.testcase)
    .where(testcaseQuery)
    .orderBy(schema.testcase.order);

  if (testcases.length === 0) {
    await fs.rm(runnerDir, { recursive: true, force: true });
    await db.update(schema.submission).set({ status: 'FAILED' }).where(eq(schema.submission.id, submissionId));
    return { status: 'FAILED', error: 'No testcases found' };
  }

  // 2. Execute
  const result = await executeCode(testcases, language, runnerDir, submissionId, limits);

  // 3. Update Submission
  await db.update(schema.submission)
    .set({
      status: result.status,
      totalTestcases: result.totalCount,
      passedTestcases: result.passedCount,
      failedTestcases: result.totalCount - result.passedCount,
      timeTaken: result.totalTime,
      memoryTaken: result.maxMemory,
      updatedAt: new Date().toISOString()
    })
    .where(eq(schema.submission.id, submissionId));

  // 4. Update Execution Result
  await db.insert(schema.executionResult)
    .values({
      submissionId,
      verdict: result.verdict,
      stdout: result.verdict === 'COMPILE_ERROR' ? result.raw : null,
      stderr: null,
    });

  await setSubmissionStatus(submissionId, result.status);
  return result;
};

export default runCodeWithInput;
