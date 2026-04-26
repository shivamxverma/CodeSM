import dotenv from "dotenv";
import mongoose from "mongoose";
import { Pool } from "pg";
import { createId } from "@paralleldrive/cuid2";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "codesm";
const DATABASE_URL = process.env.DATABASE_URL;
const SUBMISSIONS_COLLECTION = process.env.MONGO_SUBMISSIONS_COLLECTION || "submissions";
const FORCED_USER_ID = process.env.PG_SUBMISSION_USER_ID || null;

const LANGUAGE_SET = new Set(["CPP", "JAVA", "PYTHON", "JAVASCRIPT", "C", "CSHARP"]);
const STATUS_SET = new Set(["PENDING", "RUNNING", "FAILED", "COMPLETED"]);
const MODE_SET = new Set(["SUBMIT", "RUN"]);
const VERDICT_SET = new Set([
  "PENDING",
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
]);

function assertEnv() {
  if (!MONGO_URI) throw new Error("MONGO_URI is required");
  if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
}

function toStr(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value?._id != null) return String(value._id);
  return String(value);
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function pickFirst(obj, paths) {
  for (const path of paths) {
    const value = getPath(obj, path);
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeUpper(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function mapLanguage(value) {
  const raw = normalizeUpper(value).replace(/\+/g, "P");

  const direct = {
    CPP: "CPP",
    CXX: "CPP",
    CPLUSPLUS: "CPP",
    C_P_P: "CPP",
    JAVA: "JAVA",
    PY: "PYTHON",
    PY3: "PYTHON",
    PYTHON: "PYTHON",
    JS: "JAVASCRIPT",
    JAVASCRIPT: "JAVASCRIPT",
    NODE: "JAVASCRIPT",
    C: "C",
    CSHARP: "CSHARP",
    C_SHARP: "CSHARP",
    CS: "CSHARP",
  };

  const mapped = direct[raw] || direct[raw.replace(/[^A-Z_]/g, "")];
  return LANGUAGE_SET.has(mapped) ? mapped : "CPP";
}

function mapMode(value) {
  const raw = normalizeUpper(value);
  if (MODE_SET.has(raw)) return raw;
  if (raw === "PRACTICE") return "RUN";
  return "SUBMIT";
}

function mapStatus(value, verdict) {
  const raw = normalizeUpper(value);
  if (STATUS_SET.has(raw)) return raw;

  if (raw === "QUEUED") return "PENDING";
  if (raw === "ACCEPTED") return "COMPLETED";
  if (raw === "SUCCESS") return "COMPLETED";
  if (raw === "ERROR") return "FAILED";
  if (raw === "TIMEOUT") return "FAILED";
  if (raw === "CANCELLED") return "FAILED";

  if (verdict && verdict !== "PENDING") return "COMPLETED";
  return "PENDING";
}

function mapVerdict(value, status, total, passed, failed) {
  const raw = normalizeUpper(value);
  const alias = {
    WA: "WRONG_ANSWER",
    TLE: "TIME_LIMIT_EXCEEDED",
    MLE: "MEMORY_LIMIT_EXCEEDED",
    RE: "RUNTIME_ERROR",
    CE: "COMPILE_ERROR",
    OK: "ACCEPTED",
    PASS: "ACCEPTED",
    PASSED: "ACCEPTED",
    SUCCESS: "ACCEPTED",
    ERROR: "RUNTIME_ERROR",
    COMPILATION_ERROR: "COMPILE_ERROR",
  };

  const mapped = VERDICT_SET.has(raw) ? raw : alias[raw];
  if (VERDICT_SET.has(mapped)) return mapped;

  if (status === "FAILED") return "RUNTIME_ERROR";

  if (Number(total) > 0) {
    if (Number(failed) === 0 && Number(passed) === Number(total)) return "ACCEPTED";
    if (Number(failed) > 0) return "WRONG_ANSWER";
  }

  return "PENDING";
}

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
}

async function existsById(client, tableName, id) {
  const res = await client.query(`select 1 from "${tableName}" where id = $1 limit 1`, [id]);
  return res.rowCount > 0;
}

async function resolveFallbackUser(client) {
  if (FORCED_USER_ID) {
    const ok = await existsById(client, "user", FORCED_USER_ID);
    if (!ok) {
      throw new Error(`PG_SUBMISSION_USER_ID not found in "user": ${FORCED_USER_ID}`);
    }
    return FORCED_USER_ID;
  }
  return null;
}

function extractSubmission(doc) {
  const submissionId = toStr(doc._id) || createId();
  const mongoUserId = toStr(
    pickFirst(doc, ["userId", "user", "author", "submittedBy", "user._id"]),
  );
  const problemId = toStr(pickFirst(doc, ["problemId", "problem", "problem._id"]));

  const code = String(pickFirst(doc, ["code", "sourceCode", "program"]) || "");
  const language = mapLanguage(pickFirst(doc, ["language", "lang"]));
  const mode = mapMode(pickFirst(doc, ["mode", "submissionMode", "type"]));

  const totalTestcases = toInt(
    pickFirst(doc, ["totalTestcases", "totalTestCases", "results.total", "summary.total"]),
  );
  const passedTestcases = toInt(
    pickFirst(doc, ["passedTestcases", "passedTestCases", "results.passed", "summary.passed"]),
  );
  const failedTestcases = toInt(
    pickFirst(doc, ["failedTestcases", "failedTestCases", "results.failed", "summary.failed"]),
  );
  const timeTaken = toInt(pickFirst(doc, ["timeTaken", "time", "metrics.time"]));
  const memoryTaken = toInt(pickFirst(doc, ["memoryTaken", "memory", "metrics.memory"]));

  const nestedExecution =
    pickFirst(doc, ["executionResult", "execution", "result"]) ||
    (Array.isArray(doc.executionResults) ? doc.executionResults[0] : undefined);

  const tentativeVerdict = mapVerdict(
    pickFirst(doc, [
      "verdict",
      "result.verdict",
      "executionResult.verdict",
      "execution.verdict",
    ]),
    null,
    totalTestcases,
    passedTestcases,
    failedTestcases,
  );

  const status = mapStatus(
    pickFirst(doc, ["status", "result.status", "executionResult.status"]),
    tentativeVerdict,
  );
  const verdict = mapVerdict(
    pickFirst(doc, [
      "verdict",
      "result.verdict",
      "executionResult.verdict",
      "execution.verdict",
    ]),
    status,
    totalTestcases,
    passedTestcases,
    failedTestcases,
  );

  const stdout = toStr(
    pickFirst(doc, [
      "stdout",
      "result.stdout",
      "executionResult.stdout",
      "execution.stdout",
      "result.output",
      "output",
      "compileOutput",
    ]),
  );
  const stderr = toStr(
    pickFirst(doc, [
      "stderr",
      "result.stderr",
      "executionResult.stderr",
      "execution.stderr",
      "error",
      "errorMessage",
      "compileError",
    ]),
  );

  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : createdAt;

  const nestedVerdict = nestedExecution
    ? mapVerdict(
        pickFirst(nestedExecution, ["verdict", "status"]),
        status,
        totalTestcases,
        passedTestcases,
        failedTestcases,
      )
    : verdict;

  return {
    submissionId,
    mongoUserId,
    problemId,
    code,
    language,
    mode,
    status,
    verdict: nestedVerdict || verdict,
    totalTestcases,
    passedTestcases,
    failedTestcases,
    timeTaken,
    memoryTaken,
    stdout,
    stderr,
    createdAt,
    updatedAt,
  };
}

async function upsertSubmission(client, data, fallbackUserId) {
  const problemId = data.problemId;
  if (!problemId) {
    return { ok: false, reason: "missing problemId" };
  }

  const problemExists = await existsById(client, "problem", problemId);
  if (!problemExists) {
    return { ok: false, reason: `problem not found: ${problemId}` };
  }

  let userId = data.mongoUserId;
  const userExists = userId ? await existsById(client, "user", userId) : false;
  if (!userExists) {
    if (!fallbackUserId) {
      return { ok: false, reason: `user not found: ${userId || "null"}` };
    }
    userId = fallbackUserId;
  }

  await client.query(
    `insert into submission (
      id, problem_id, user_id, mode, code, language, status,
      total_testcases, passed_testcases, failed_testcases,
      time_taken, memory_taken, created_at, updated_at
    )
    values (
      $1, $2, $3, $4::"SubmissionMode", $5, $6::"Language", $7::"JobStatus",
      $8, $9, $10, $11, $12, $13, $14
    )
    on conflict (id) do update set
      problem_id = excluded.problem_id,
      user_id = excluded.user_id,
      mode = excluded.mode,
      code = excluded.code,
      language = excluded.language,
      status = excluded.status,
      total_testcases = excluded.total_testcases,
      passed_testcases = excluded.passed_testcases,
      failed_testcases = excluded.failed_testcases,
      time_taken = excluded.time_taken,
      memory_taken = excluded.memory_taken,
      updated_at = excluded.updated_at`,
    [
      data.submissionId,
      problemId,
      userId,
      data.mode,
      data.code,
      data.language,
      data.status,
      data.totalTestcases,
      data.passedTestcases,
      data.failedTestcases,
      data.timeTaken,
      data.memoryTaken,
      data.createdAt,
      data.updatedAt,
    ],
  );

  await client.query(`delete from execution_result where submission_id = $1`, [data.submissionId]);
  await client.query(
    `insert into execution_result (
      id, submission_id, verdict, stdout, stderr, created_at, updated_at
    )
    values (
      $1, $2, $3::"Verdict", $4, $5, $6, $7
    )`,
    [
      createId(),
      data.submissionId,
      data.verdict,
      data.stdout,
      data.stderr,
      data.createdAt,
      data.updatedAt,
    ],
  );

  return { ok: true };
}

async function main() {
  assertEnv();

  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  const mongoDb = mongoose.connection.db;
  const mongoSubmissions = await mongoDb
    .collection(SUBMISSIONS_COLLECTION)
    .find({})
    .toArray();
  console.log(`Mongo submissions found: ${mongoSubmissions.length}`);

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    const fallbackUserId = await resolveFallbackUser(client);
    if (fallbackUserId) {
      console.log(`Using fallback Postgres user_id: ${fallbackUserId}`);
    }

    let migrated = 0;
    let skipped = 0;

    for (const doc of mongoSubmissions) {
      const data = extractSubmission(doc);
      try {
        await client.query("begin");
        const result = await upsertSubmission(client, data, fallbackUserId);
        if (!result.ok) {
          await client.query("rollback");
          skipped += 1;
          console.warn(`Skipped ${data.submissionId}: ${result.reason}`);
          continue;
        }
        await client.query("commit");
        migrated += 1;
      } catch (err) {
        await client.query("rollback");
        skipped += 1;
        console.error(`Failed ${data.submissionId}:`, err.message);
      }
    }

    console.log(
      `Submission migration complete. Success: ${migrated}/${mongoSubmissions.length}, skipped: ${skipped}`,
    );
  } finally {
    client.release();
    await pool.end();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Submission migration failed:", err);
  process.exitCode = 1;
});
