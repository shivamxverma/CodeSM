import { db } from "../../loaders/postgres.js";
import { eq, and } from "drizzle-orm";
import { schema } from "../../db/index.ts";
import fs from "fs/promises";
import { redisClient } from "../../loaders/redis.js";

function normalizeJobStatus(status, verdict) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "PENDING" || normalized === "RUNNING" || normalized === "FAILED" || normalized === "COMPLETED") {
    return normalized;
  }

  // Map verdict-style statuses (e.g. COMPILE_ERROR) to a valid JobStatus enum.
  if (String(verdict || "").toUpperCase() === "PENDING") {
    return "PENDING";
  }
  return "FAILED";
}

export async function updateExecutionResult(submissionId, result) {
  const jobStatus = normalizeJobStatus(result.status, result.verdict);

  await db
    .update(schema.submission)
    .set({
      status: jobStatus,
      totalTestcases: result.totalCount,
      passedTestcases: result.passedCount,
      failedTestcases: result.totalCount - result.passedCount,
      timeTaken: result.totalTime,
      memoryTaken: result.maxMemory,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.submission.id, submissionId));

  // Persist execution result
  await db.insert(schema.executionResult).values({
    submissionId,
    verdict: result.verdict,
    // For compile errors store the raw compiler output, otherwise null
    stdout: result.verdict === "COMPILE_ERROR" ? (result.raw ?? null) : null,
    stderr: null,
  });
}

export async function fetchTestCases(problemId, mode) {
  const cacheKey = `db_testcases:${problemId}:${mode}`;
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Do not trust/stick to cached empty results. Re-query DB in case data was migrated later.
    await redisClient.del(cacheKey);
  }

  const testcaseQuery =
    mode === "RUN"
      ? and(
          eq(schema.testcase.problemId, problemId),
          eq(schema.testcase.isSample, true),
        )
      : eq(schema.testcase.problemId, problemId);

  const testcases = await db
    .select()
    .from(schema.testcase)
    .where(testcaseQuery)
    .orderBy(schema.testcase.order);

  // Cache only positive results for 1 hour; avoid stale empty-cache issue.
  if (testcases.length > 0) {
    await redisClient.set(cacheKey, JSON.stringify(testcases), "EX", 3600);
  }

  return testcases;
}

export async function noTestcasesFound(submissionId, runnerDir) {
  await fs.rm(runnerDir, { recursive: true, force: true });
  await db
    .update(schema.submission)
    .set({ status: "FAILED" })
    .where(eq(schema.submission.id, submissionId));
  return { status: "FAILED", error: "No testcases found" };
}
