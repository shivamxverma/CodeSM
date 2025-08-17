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

    let role = "AUTHOR";
    const problem = await Problem.findById(problemId);
    let user = await Author.findById(req.user._id).select("-password -refreshToken");
    let isAuthor = !!user;
    if (!isAuthor) {
        role = "USER";
        user = await User.findById(req.user._id).select("-password -refreshToken");
    }

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    let output;
    try {
        output = await runCppCodeWithInput(code, problem, dryRun);
    } catch (err) {
        console.error("Error running code:", err);
        throw new ApiError(500, "Failed to run code due to an internal error");
    }

    if (dryRun) {
        return res.status(200).json(new ApiResponse(200, output, "Dry run completed successfully"));
    }

    const newSubmission = await Submission.create({
        user: role == "AUTHOR" ? null : user,
        author: role == "AUTHOR" ? user : null,
        problem: problem._id,
        code,
        language,
        status: output.status
    });

    if (!newSubmission) {
        throw new ApiError(500, "Failed to create submission");
    }

    res.status(201).json(new ApiResponse(201, { output }, "Submission created successfully"));
});

const getAllSubmissionById = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    let author = await Author.findById(req.user._id);
    let submissions;
    if (author) {
        submissions = await Submission.find({ problem: problem._id, author: req.user._id });
        submissions = submissions.map(sub => ({
            ...sub.toObject(),
            username: author.username
        }));
    } else {
        submissions = await Submission.find({ problem: problem._id, user: req.user._id });
        submissions = submissions.map(sub => ({
            ...sub.toObject(),
            username: req.user.username
        }));
    }

    res.status(200).json(new ApiResponse(200, submissions, "Submission fetched successfully"));
});

export { createSubmission, getAllSubmissionById };
