import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { myQueue } from '../config/queue.config.js'; 
import Submission from '../models/submission.model.js';
import Problem from '../models/problem.model.js';

const getJobResponse = asyncHandler(async (req, res) => {

    const { jobId, problemId } = req.params;
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

    const problem = await Problem.findById(problemId);

    if(!problem) {
        throw new ApiError(404, 'Problem not found for submission');
    }

    // console.log(jobResult);

    // const Submitted = await Submission.create({
    //     user: req.user,
    //     problem,
    //     code: jobData.code,
    //     language: jobData.language,
    //     status: jobResult.output.status,
    // });

    // console.log("Submission recorded:", Submitted);

    if(!Submitted) {
        throw new ApiError(500, 'Failed to record submission');
    }

    return res.status(200).json(
        new ApiResponse(200, 'Job fetched successfully', {
            state,
            jobData,
            result: jobResult.output,
        })
    );
});

export { getJobResponse };