import { ApiError } from "../utils/ApiError.js";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import { myQueue } from "../config/queue.config.js";

const runCode = asyncHandler(async (req, res) => {
    const { code, language } = req.body;
    const { problemId } = req.params;

    if ([problemId, code, language].some(field => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const job = await myQueue.add({
        problemId : problemId,
        code,
        language,
        dryRun: true
    });

    res.status(201).json(new ApiResponse(201, { id: job.id }, "Code execution started"));
});

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language } = req.body;
    const { problemId } = req.params;

    if ([problemId, code, language].some(field => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const Submitted = await Submission.create({
        user: req.user,
        problem,
        code: code,
        language: language,
    });

    if (!Submitted) {
        throw new ApiError(500, 'Failed to record submission');
    }

    const job = await myQueue.add({
        submissionId : Submitted._id,
        dryRun: false
    });
    console.log(job);

    res.status(201).json(
        new ApiResponse(
            201,
            { id: job.id, submissionId: String(Submitted._id) },
            "Submission created successfully"
        )
    );
});

const getAllSubmissionById = asyncHandler(async (req, res) => {
    console.log("getAllSubmissionById");
    const { problemId } = req.params;
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const submissions = await Submission.find({ problem: problem._id, user: req.user }).populate('user', 'username');


    if (!submissions) {
        throw new ApiError(404, "Submissions Not Found");
    }

    res.status(200).json(new ApiResponse(200, submissions, "Submission fetched successfully"));
});

export { createSubmission, getAllSubmissionById, runCode };
