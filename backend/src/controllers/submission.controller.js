import {ApiError} from "../utils/ApiError.js";
import Submission from "../model/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import runCppCodeWithInput from "../utils/runCode.js"; 
import { downloadFile } from "../utils/downloadfile.js";
import Problem from "../model/problem.model.js";

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language , problemId } = req.body;
    const user = "68483f7d391860b5e5e9d460";

    if ([problemId, user, code, language].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);

    if(!problem){
        throw new ApiError(404, "Problem not found");
    }

    // console.log("Problem found:", problem);

    // console.log('testcases: ',problem.testcases);

    // const testcases = problem.testcases;

    // await downloadFile(testcases);

    // const newSubmission = await Submission.create({
    //     // user,
    //     // problemId,
    //     code,
    //     // language
    // });

    // console.log("New submission created:", newSubmission);

    const output = await runCppCodeWithInput(code, problem.title);

    console.log("Code execution output:", output);

    // console.log("Code execution result:", output);

    // if (!newSubmission) {
    //     throw new ApiError(500, "Something went wrong creating submission");
    // }


    // console.log("New submission created:", newSubmission);


    // console.log("Submission details:", { problemId, userId, language });

    res.status(201).json(new ApiResponse(201, {}, "Submission created successfully"));
})

export { createSubmission };
