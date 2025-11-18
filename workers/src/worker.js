import myQueue from "./queue.js";
import runCppCodeWithInput from "./runCode.js";

console.log("Why brother");

myQueue.process(async(job)=> {
  console.log("Work Reached Here");
  const { code, language, problem, dryRun,isAuthor } = job.data;
  const output = await runCppCodeWithInput(code, problem, dryRun);

  console.log("Job completed with output:", output);

  const newOutput = {
    output,
    problem,
    code,
    language,
    isAuthor,
    dryRun
  }
  return newOutput;
});