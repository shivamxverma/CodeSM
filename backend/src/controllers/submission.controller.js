import {ApiError} from "../utils/ApiError.js";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import runCppCodeWithInput from "../utils/runCode.js"; 
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import Author from "../models/author.model.js";

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language } = req.body;
    const { problemId } = req.params;
    const dryRun = req.query.dryRun === "true";
    console.log("Entering into createSubmission");
    if ([problemId, code, language].some(field => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);
    const user = req.user.role === "AUTHOR"
        ? await Author.findById(req.user._id).select("-password -refreshToken")
        : await User.findById(req.user._id).select("-password -refreshToken");

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const output = await runCppCodeWithInput(code, problem._id);

    console.log("Output from runCppCodeWithInput: ", output);

    if (dryRun) {
        if (problem.sampleInput && problem.sampleOutput) {
            const sampleOutput = await runCodeWithInput(code, problem._id, problem.sampleInput);
            return res.status(200).json(new ApiResponse(200, { output: sampleOutput }, "Dry run output with sample input"));
        }
        // Only return output, do not create a submission
        return res.status(200).json(new ApiResponse(200, { output }, "Dry run output"));
    }

    const newSubmission = await Submission.create({
        user: req.user.role == "AUTHOR" ? null : user,
        author: req.user.role == "AUTHOR" ? user : null,
        problem,
        code,
        language,
        status: output.status
    });

    if (!newSubmission) {
        throw new ApiError(500, "Failed to create submission");
    }

    res.status(201).json(new ApiResponse(201, { output }, "Submission created successfully"));
});

const getSubmissionById = asyncHandler(async (req, res) => {
    const { problemId } = req.query;
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }
    const submissions = req.user.role === "AUTHOR"
        ? await Submission.find({ problem: problem._id, author: req.user._id })
        : await Submission.find({ problem: problem._id, user: req.user._id });
    res.status(200).json(new ApiResponse(200, submissions, "Submission fetched successfully"));
})

export { createSubmission, getSubmissionById };
