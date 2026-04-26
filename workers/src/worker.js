import { Worker, Queue } from "bullmq";
import runCodeWithInput from "./code/index.js";
import { getDrizzleClient, db } from "../loaders/postgres.js";
import { setSubmissionStatus } from "../loaders/redis.js";
import { schema } from "../db/index.ts";
import { eq } from "drizzle-orm";
import env from "../config/index.js";

const connection = {
  url: env.REDIS_URL,
};

const createJobProcessor = (mode) => async (job) => {
  const {
    submissionId,
    code,
    language,
    problemId,
    timeLimit,
    memoryLimit,
  } = job.data;

  console.log(
    `[${mode} Worker] Picking up job for submissionId: ${submissionId}, language: ${language}`
  );

  await db
    .update(schema.submission)
    .set({ status: "RUNNING" })
    .where(eq(schema.submission.id, submissionId));

  await setSubmissionStatus(submissionId, "RUNNING");

  console.log(
    `[${mode} Worker] Starting execution for submission ${submissionId} in ${mode} mode`
  );

  try {
    return await runCodeWithInput(
      code,
      language,
      problemId,
      submissionId,
      { timeLimit, memoryLimit },
      mode
    );
  } catch (err) {
    console.error(`[${mode} Worker] Execution error for ${submissionId}:`, err);
    // We intentionally DO NOT mark the submission as "FAILED" here.
    // If there are retries left, BullMQ will retry it.
    // If it exhausts all retries, the 'failed' event listener will mark it as "FAILED".
    throw err;
  }
};

const startWorkers = async () => {
  try {
    await getDrizzleClient();
    console.log("Database connected. Starting workers...");

    const deadLetterQueue = new Queue("dead-letter-queue", { connection });

    const handleJobFailure = async (job, err, mode) => {
      console.error(`[${mode} Worker] Job ${job?.id} failed on attempt ${job?.attemptsMade} with error:`, err.message);
      
      const maxAttempts = job?.opts?.attempts || 1;
      if (job?.attemptsMade >= maxAttempts) {
        console.log(`[${mode} Worker] Job ${job?.id} exhausted all attempts. Moving to Dead Letter Queue.`);
        
        const submissionId = job?.data?.submissionId;
        if (submissionId) {
          try {
            await db
              .update(schema.submission)
              .set({ status: "FAILED" })
              .where(eq(schema.submission.id, submissionId));
            await setSubmissionStatus(submissionId, "FAILED");
          } catch (dbErr) {
            console.error(`[DLQ Error] Failed to mark submission ${submissionId} as FAILED:`, dbErr);
          }
        }
        
        try {
          await deadLetterQueue.add(`failed-${mode.toLowerCase()}-job`, {
            originalQueue: `${mode.toLowerCase()}-queue`,
            originalJobId: job.id,
            failedReason: err.message,
            data: job.data,
            failedAt: new Date().toISOString()
          });
        } catch (dlqErr) {
          console.error(`[DLQ Error] Failed to move job ${job?.id} to DLQ:`, dlqErr);
        }
      }
    };

    const submitWorker = new Worker("submit-queue", createJobProcessor("SUBMIT"), { connection });
    submitWorker.on("failed", (job, err) => handleJobFailure(job, err, "SUBMIT"));

    const runWorker = new Worker("run-queue", createJobProcessor("RUN"), { connection });
    runWorker.on("failed", (job, err) => handleJobFailure(job, err, "RUN"));

    console.log("Workers started and listening for jobs on 'submit-queue' and 'run-queue'...");
  } catch (err) {
    console.error("Error starting workers:", err);
    process.exit(1);
  }
};

startWorkers();
