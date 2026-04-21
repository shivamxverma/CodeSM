import { myQueue } from "./queue.js";
import runCodeWithInput from "./runCode.js";
import { getDrizzleClient, db } from "../loaders/postgres.js";
import { setSubmissionStatus } from "./redis.js";
import { schema } from "db-schema";
import { eq } from "drizzle-orm";

getDrizzleClient()
  .then(() => {
    console.log("Worker started and waiting for jobs...");

    myQueue.process(async (job) => {
      console.log("Work Reached Here");
      const { submissionId, mode } = job.data;
      
      console.log(`[Worker] Picking up job for submissionId: ${submissionId}, mode: ${mode}`);

      // 1. Fetch submission details
      const submissions = await db
        .select()
        .from(schema.submission)
        .where(eq(schema.submission.id, submissionId))
        .limit(1);

      if (submissions.length === 0) {
        console.error(`[Worker] Submission ${submissionId} not found in DB`);
        return null;
      }

      const sub = submissions[0];

      // 2. Update status to RUNNING
      console.log(`[Worker] Marking submission ${submissionId} as RUNNING`);
      await db.update(schema.submission)
        .set({ status: 'RUNNING' })
        .where(eq(schema.submission.id, submissionId));
      
      await setSubmissionStatus(submissionId, "RUNNING");

      // 3. Fetch problem limits
      const problems = await db
        .select()
        .from(schema.problem)
        .where(eq(schema.problem.id, sub.problemId))
        .limit(1);

      if (problems.length === 0) {
        console.error(`[Worker] Problem ${sub.problemId} not found for submission ${submissionId}`);
        await db.update(schema.submission)
          .set({ status: 'FAILED' })
          .where(eq(schema.submission.id, submissionId));
        await setSubmissionStatus(submissionId, "FAILED");
        return null;
      }

      const prob = problems[0];
      const timeLimit = prob.timeLimit || 2;
      const memoryLimit = prob.memoryLimit || 256;

      console.log(`[Worker] Starting execution for submission ${submissionId} in ${mode} mode`);
      
      try {
        return await runCodeWithInput(
          sub.code,
          sub.language,
          sub.problemId,
          submissionId,
          mode,
          { timeLimit, memoryLimit }
        );
      } catch (err) {
        console.error(`[Worker] Execution error for ${submissionId}:`, err);
        await db.update(schema.submission)
          .set({ status: 'FAILED' })
          .where(eq(schema.submission.id, submissionId));
        await setSubmissionStatus(submissionId, "FAILED");
        throw err;
      }
    });
  })
  .catch(err => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });