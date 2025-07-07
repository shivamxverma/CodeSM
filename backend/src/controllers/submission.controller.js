import {ApiError} from "../utils/ApiError.js";
import Submission from "../model/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import runCppCodeWithInput from "../utils/runCode.js"; 
import Problem from "../model/problem.model.js";
import {User} from "../model/user.model.js";

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language , userId } = req.body;
    const { problemId } = req.params;

    console.log("Request Body: ", req.body);
    if ([problemId, userId, code, language].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);
    const user = await User.findById(userId).select("-password -refreshToken");

    if(!problem){
        throw new ApiError(404, "Problem not found");
    }

    const output = await runCppCodeWithInput(code, problem.title);

    const newSubmission = await Submission.create({
        user,
        problem,
        code,
        language,
        status: output.status
    });

    if( !newSubmission) {
        throw new ApiError(500, "Failed to create submission");
    }

    res.status(201).json(new ApiResponse(201, { output }, "Submission created successfully"));
})

export { createSubmission };
