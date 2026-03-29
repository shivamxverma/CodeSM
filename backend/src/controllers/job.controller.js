import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { myQueue } from '../config/queue.config.js';
import JobResult from '../models/jobresult.model.js';

const getSubmitJobResponse = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    if (!submissionId || typeof submissionId !== 'string' || submissionId.trim() === '') {
        throw new ApiError(400, 'Valid Submission ID is required');
    }
    const jobResult = await JobResult.findOne({ submissionId });
    if (!jobResult) {
        throw new ApiError(404, 'Job result not found');
    }
    if (jobResult.status === 'failed') {
        throw new ApiError(400, 'Job failed');
    }

    return res.status(200).json(
        new ApiResponse(200, 'Job result fetched successfully', {
            result: jobResult,
        })
    );
});

const getJobResponse = asyncHandler(async (req, res) => {

    const { jobId } = req.params;
    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
        throw new ApiError(400, 'Valid Job ID is required');
    }
    let job;
    try {
        job = await myQueue.getJob(jobId);
    } catch (error) {
        throw new ApiError(500, `Failed to fetch job: ${error.message}`);
    }

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    let state;
    try {
        state = await job.getState();
    } catch (error) {
        throw new ApiError(500, `Failed to fetch job state: ${error.message}`);
    }

    const jobData = job.data || null;
    const jobResult = job.returnvalue || null;

    if (state !== 'completed') {
        let message = 'Job still processing';
        if (state === 'failed') {
            message = 'Job failed';
        } else if (state === 'waiting') {
            message = 'Job is waiting to be processed';
        } else if (state === 'active') {
            message = 'Job is currently being processed';
        }

        return res.status(200).json(
            new ApiResponse(200, message, {
                state,
                jobData,
            })
        );
    }

    if (!jobResult) {
        return res.status(200).json(
            new ApiResponse(200, 'Job completed; fetch stored result if needed', {
                state,
                jobData,
                result: null,
                fetchStoredResult: true,
            })
        );
    }

    return res.status(200).json(
        new ApiResponse(200, 'Job fetched successfully', {
            state,
            jobData,
            result: jobResult.output,
        })
    );
});

const getRunJobResponse = getJobResponse;

export { getJobResponse, getRunJobResponse, getSubmitJobResponse };