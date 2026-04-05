import { ApiError } from "../utils/ApiError.js";
import Submission from "../models/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Problem from "../models/problem.model.js";
import { myQueue } from "../config/queue.config.js";
import redis from "../config/redis.config.js";

const IDEMPOTENCY_SUBMIT_TTL_SEC = Math.min(
    Math.max(parseInt(process.env.IDEMPOTENCY_SUBMIT_TTL_SEC || "86400", 10) || 86400, 60),
    7 * 24 * 3600
);

function readSubmitIdempotencyKey(req) {
    const raw = req.headers["idempotency-key"] ?? req.headers["Idempotency-Key"];
    if (raw == null || raw === "") return null;
    const key = String(raw).trim();
    if (key.length < 8 || key.length > 128) {
        throw new ApiError(400, "Idempotency-Key must be between 8 and 128 characters");
    }
    if (!/^[\w.-]+$/i.test(key)) {
        throw new ApiError(400, "Idempotency-Key contains invalid characters");
    }
    return key;
}

function submitIdempotencyRedisKey(userId, problemId, idempotencyKey) {
    return `idemp:submit:${userId}:${problemId}:${idempotencyKey}`;
}

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

    const idempotencyKey = readSubmitIdempotencyKey(req);
    console.log("Shivam Here",idempotencyKey);
    const userId = String(req.user._id ?? req.user.id);

    if (idempotencyKey) {
        console.log("shivam here before i key");
        const cacheKey = submitIdempotencyRedisKey(userId, problemId, idempotencyKey);
        const cached = await redis.get(cacheKey);
        if (cached) {
            try {
                const { submissionId, jobId } = JSON.parse(cached);
                console.log("shivam here in creation key");
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            id: jobId,
                            submissionId,
                            idempotentReplay: true,
                        },
                        "Submission already recorded for this idempotency key"
                    )
                );
            } catch {
                await redis.del(cacheKey);
            }
        }
    }

    const Submitted = await Submission.create({
        user: req.user,
        problem,
        code: code,
        language: language,
    });

    if (!Submitted) {
        throw new ApiError(500, "Failed to record submission");
    }

    const job = await myQueue.add(
        { submissionId: Submitted._id, dryRun: false },
        { jobId: `grade:${Submitted._id}` },
    );

    const submissionId = String(Submitted._id);
    const jobId = job.id;

    if (idempotencyKey) {
        const cacheKey = submitIdempotencyRedisKey(userId, problemId, idempotencyKey);
        await redis.setex(
            cacheKey,
            IDEMPOTENCY_SUBMIT_TTL_SEC,
            JSON.stringify({ submissionId, jobId })
        );
    }

    console.log("shivam here in after key");


    res.status(201).json(
        new ApiResponse(
            201,
            { id: jobId, submissionId },
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
