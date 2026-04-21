export interface IGetSubmissionResponse {
    submissionId : string,
    status : string
}

export interface IGetSubmissionResultsResponse {
    submissionId : string,
    verdict : string,
    language : string,
    timeTaken : number,
    memoryTaken : number,
    totalTestcases : number,
    passedTestcases : number,
    failedTestcases : number,
    stdout: string | null,
    stderr: string | null,
}
