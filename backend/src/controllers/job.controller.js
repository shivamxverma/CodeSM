import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { myQueue } from '../config/queue.config.js'; 
import Submission from '../models/submission.model.js';

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
        throw new ApiError(500, 'Job completed but no result found');
    }

    // if (job.dryRun === false) {
    //     await Submission.create({
    //         jobId: job.id,
    //         result: jobResult.output,
    //     });
    // }

    return res.status(200).json(
        new ApiResponse(200, 'Job fetched successfully', {
            state,
            jobData,
            result: jobResult.output,
        })
    );
});

export { getJobResponse };