export interface ICreateProblemRequest {
    title : string,
    description : string,
    slug : string,
    difficulty : string,
    inputFormat : string,
    outputFormat : string,
    constraints : string,
    timeLimit : number,
    memoryLimit : number,
    editorialContent : string,
    editorialLink : string,
    solution : string,
    tags : string[],
    testcases : number,
    sampleTestcases : number,
}

export interface ICreateProblemResponse {
    message : string,
    problemId : string,
    uploadUrls : string[]
}

export interface IFinalizeProblemResponse {
    message : string,
    status : boolean
}