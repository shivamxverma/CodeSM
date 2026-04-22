import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { myQueue } from '../config/queue.config.js';
import JobResult from '../models/jobresult.model.js';
import redis from '../config/redis.config.js'; // Use consolidated redis

const getSubmitJobResponse = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    console.log(`[getSubmitJobResponse] Polling results for submissionId: ${submissionId}`);

    if (!submissionId || typeof submissionId !== 'string' || submissionId.trim() === '') {
        throw new ApiError(400, 'Valid Submission ID is required');
    }

    // Check Redis first
    const redisKey = `submission:${submissionId}`;
    console.log(`[getSubmitJobResponse] Checking Redis key: ${redisKey}`);
    
    const cachedData = await redis.get(redisKey);
    if (cachedData) {
        console.log(`[getSubmitJobResponse] Found data in Redis for key: ${redisKey}`);
        const metadata = JSON.parse(cachedData);
        return res.status(200).json(
            new ApiResponse(200, 'Job metadata fetched from cache', {
                result: metadata,
            })
        );
    }

    console.log(`[getSubmitJobResponse] Redis cache miss for key: ${redisKey}. Falling back to DB.`);

    // Fallback to DB
    const jobResult = await JobResult.findOne({ submissionId });
    if (!jobResult) {
        console.log(`[getSubmitJobResponse] JobResult not found in DB for submissionId: ${submissionId}. Returning pending state.`);
        return res.status(200).json(
            new ApiResponse(200, 'Job is pending', {
                result: { status: 'pending' },
            })
        );
    }

    console.log(`[getSubmitJobResponse] Found data in DB for submissionId: ${submissionId}`);
    if (jobResult.status === 'failed') {
        throw new ApiError(400, 'Job failed');
    }

    return res.status(200).json(
        new ApiResponse(200, 'Job result fetched successfully', {
            result: jobResult,
        })
    );
});

const getRunJobResult = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
        throw new ApiError(400, 'Valid Job ID is required');
    }

    const redisKey = `run:${jobId}`;
    const cachedData = await redis.get(redisKey);
    
    if (cachedData) {
        const metadata = JSON.parse(cachedData);
        return res.status(200).json(
            new ApiResponse(200, 'Run job metadata fetched from cache', {
                result: metadata,
            })
        );
    }

    return res.status(200).json(
        new ApiResponse(200, 'Run job is pending or not found', {
            result: { status: 'pending' },
        })
    );
});

export { getSubmitJobResponse, getRunJobResult };