import { runQueue, submitQueue } from "../../loaders/queue";

export async function createRunQueue(
  submissionId: string,
  code: string,
  language: string,
  problemId: string,
  timeLimit: number,
  memoryLimit: number
) {
  return await runQueue.add(
    "run-code",
    {
      submissionId,
      code,
      language,
      problemId,
      timeLimit,
      memoryLimit
    },
    {
      jobId: submissionId,
      attempts: 1,
      priority: 1,
      removeOnComplete: true,
      removeOnFail: 50
    }
  );
}

export async function createSubmitQueue(
  submissionId: string,
  code: string,
  language: string,
  problemId: string,
  timeLimit: number,
  memoryLimit: number
) {
  return await submitQueue.add(
    "submit-code",
    {
      submissionId,
      code,
      language,
      problemId,
      timeLimit,
      memoryLimit
    },
    {
      jobId: submissionId,
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 1000
      },
      priority: 2,
      removeOnComplete: true,
      removeOnFail: 50
    }
  );
}