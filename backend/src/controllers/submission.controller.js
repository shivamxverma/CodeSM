import { ApiError } from "../utils/ApiError";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language } = req.body;
    const problemId = req.params.problemId;

    const user = req.user._id;

    if ([problemId, user, code, language].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const newSubmission = await Submission.create({
        user,
        problemId,
        code,
        language
    });

    // const runCode = await 

    if (!newSubmission) {
        throw new ApiError(500, "Something went wrong creating submission");
    }


    console.log("New submission created:", newSubmission);


    console.log("Submission details:", { problemId, userId, language });

    res.status(201).json(ApiResponse(201, newSubmission, "Submission created successfully"));
})

export { createSubmission };
