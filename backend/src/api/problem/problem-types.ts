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
    uploadUrls : string[],
    uploadContentUrl : string,
    uploadSolutionUrl : string,
}

export interface IFinalizeProblemResponse {
    message : string,
    status : boolean
}

export interface Testcase {
    id : string,
    order : number,
    input : string,
    output : string,
}

export interface IProblem {
    id : string,
    title : string,
    description : string,
    slug : string,
    difficulty : string,
    tags : string[],
    createdAt : Date,
    updatedAt : Date,
}

export interface IAProblem {
    id : string,
    title : string,
    description : string,
    slug : string,
    difficulty : string,
    inputFormat : string,
    outputFormat : string,
    constraints : string,
    timeLimit : number,
    memoryLimit : number,
    tags : string[],
    sampleTestcases : Testcase[],
    createdAt : Date,
    updatedAt : Date,
}

export interface IGetProblemsResponse {
    problems: IProblem[];
    nextCursor: string | null;
}
