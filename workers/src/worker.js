import myQueue from "./queue.js";
import runCppCodeWithInput, { dryRunCppCodeWithInput } from "./runCode.js";
import connectDB from "./db.config.js";
import Submission from "../models/submission.model.js";

connectDB()

  .then(() => {
    console.log("Worker started and waiting for jobs...");

    myQueue.process(async (job) => {
      console.log("Work Reached Here");
      const { dryRun } = job.data;

      if(dryRun) {
        const { code, language, problem } = job.data;
        const output = await dryRunCppCodeWithInput(code, language, problem);
        return output;
      }
      
      const { submissionId } = job.data;
      const submission = await Submission.findById(submissionId);
      const output = await runCppCodeWithInput(submission.code, submission.language, submission.problem._id, submissionId);
      return output;
    });
  })
  .catch(err => {
    console.error("Error Connecting to MongoDB:", err);
    process.exit(1);
  });