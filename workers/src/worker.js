import {myQueue} from "./queue.js";
import runCodeWithInput, { dryRunCodeWithInput } from "./runCode.js";
import connectDB from "./db.config.js";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";

connectDB()

  .then(() => {
    console.log("Worker started and waiting for jobs...");

    myQueue.process(async (job) => {
      console.log("Work Reached Here");
      const { dryRun } = job.data;

      console.log(job.data);

      if (dryRun) {
        const { code, language, problemId } = job.data;
        const problem = await Problem.findById(problemId).lean();
        if (!problem) {
          return { status: "error", error: "Problem not found" };
        }
        const response = await dryRunCodeWithInput(code, language, problem);
        return response;
      }

      const { submissionId } = job.data;
      const submission = await Submission.findById(submissionId).populate("problem");
      if (!submission) {
        throw new Error(`Submission not found: ${submissionId}`);
      }
      console.log("Submission found");
      const problemId = submission.problem?._id ?? submission.problem;
      console.log(problemId);
      return runCodeWithInput(
        submission.code,
        submission.language,
        problemId,
        submissionId
      );
      // console.log(output);
    });
  })
  .catch(err => {
    console.error("Error Connecting to MongoDB:", err);
    process.exit(1);
  });