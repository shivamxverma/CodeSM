import {ApiError} from "../utils/ApiError.js";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import runCppCodeWithInput from "../utils/runCode.js"; 
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language} = req.body;
    const { problemId } = req.params;
    console.log("Entering into createSubmission");
    if ([problemId, code, language].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if(!problem){
        throw new ApiError(404, "Problem not found");
    }

    const output = await runCppCodeWithInput(code, problem.title);

    console.log("Output from runCppCodeWithInput: ", output);

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
