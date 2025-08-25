import {ApiError} from "../utils/ApiError.js";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import { myQueue } from "../config/queue.config.js";

const createSubmission = asyncHandler(async (req, res) => {

    console.log("Entering into createSubmission");
    const { code, language } = req.body;
    const { problemId } = req.params;
    const dryRun = req.query.dryRun === "true";
    console.log("Entering into createSubmission");
    if ([problemId, code, language].some(field => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);
    const user = await User.findById(req.user._id).select("-password -refreshToken");


    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const job = await myQueue.add({
        code,
        language,
        problem,
        dryRun
    });

    res.status(201).json(new ApiResponse(201, { id: job.id }, "Submission created successfully"));
});

const getAllSubmissionById = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const submissions = await Submission.find({ problem: problem._id, author: req.user }).populate('user','username');

    res.status(200).json(new ApiResponse(200, submissions, "Submission fetched successfully"));
});

export { createSubmission, getAllSubmissionById };
