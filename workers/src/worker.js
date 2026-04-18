import {myQueue} from "./queue.js";
import runCodeWithInput, { dryRunCodeWithInput } from "./runCode.js";
import connectDB from "./db.config.js";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";
import { setSubmissionStatus, setRunStatus } from "./redis.js";

connectDB()

  .then(() => {
    console.log("Worker started and waiting for jobs...");

    myQueue.process(async (job) => {
      console.log("Work Reached Here");
      const { dryRun } = job.data;
      if (dryRun) {
        const { code, language, problemId } = job.data;
        const jobId = job.id;
        console.log(`[Worker] Picking up dry-run job: ${jobId}`);
        await setRunStatus(jobId, "processing");
        const problem = await Problem.findById(problemId).lean();
        if (!problem) {
          await setRunStatus(jobId, "failed", { error: "Problem not found" });
          return null;
        }
        
        await dryRunCodeWithInput(code, language, problem, jobId);
        return null; // Return null since UI fetches from Redis directly
      }

      const { submissionId } = job.data;
      console.log(`[Worker] Picking up job for submissionId: ${submissionId}`);

      const submission = await Submission.findById(submissionId).populate("problem");
      if (!submission) {
        console.error(`[Worker] Submission ${submissionId} not found in DB`);
        throw new Error(`Submission not found: ${submissionId}`);
      }
      
      // Update status to processing
      console.log(`[Worker] Marking submission ${submissionId} as processing`);
      submission.status = "processing";
      await submission.save();
      await setSubmissionStatus(submissionId, "processing");

      console.log(`[Worker] Submission found and marked as processing`);
      const problem = submission.problem;
      const problemId = problem?._id ?? problem;
      
      const timeLimit = problem?.timeLimit || 2; // Default to 2s if not specified
      const memoryLimit = problem?.memoryLimit || 256; // Default to 256MB if not specified

      console.log(`[Worker] Starting execution for submission ${submissionId} with limits: ${timeLimit}s, ${memoryLimit}MB`);
      return runCodeWithInput(
        submission.code,
        submission.language,
        problemId,
        submissionId,
        { timeLimit, memoryLimit }
      );
      // console.log(output);
    });
  })
  .catch(err => {
    console.error("Error Connecting to MongoDB:", err);
    process.exit(1);
  });