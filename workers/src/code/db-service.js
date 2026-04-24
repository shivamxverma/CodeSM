import { db } from "../../loaders/postgres.js";
import { eq, and } from "drizzle-orm";
import { schema } from "db-schema";
import fs from "fs/promises";
import { redisClient } from "../../loaders/redis.js";

export async function updateExecutionResult(submissionId, result) {
  await db
    .update(schema.submission)
    .set({
      status: result.status,
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
    return JSON.parse(cachedData);
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

  // Cache the result for 1 hour
  await redisClient.set(cacheKey, JSON.stringify(testcases), "EX", 3600);

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
