import asyncHandler from "../../utils/asyncHandler";
import { jwtReq } from "../../types";
import { Response } from "express";
import { handleCreateSubmission, handlegetSubmissionStatus, handleGetSubmissionResults } from "./submission-service";

export const createSubmission = asyncHandler(async (req: jwtReq, res: Response) => {
    const { problemId, mode } = req.params;
    const { code, language } = req.body;
    const userId = req.user.id;
    
    const response = await handleCreateSubmission(userId, problemId as string, code, language, mode as string);
    return res.status(200).json({
        status: 'success',
        message: 'Submission created successfully',
        data: response
    })
})

export const getSubmissionStatus = asyncHandler(async (req: jwtReq, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user.id;
    
    const response = await handlegetSubmissionStatus(userId, submissionId as string);
    return res.status(200).json({
        status: 'success',
        message: 'Submission response fetched successfully',
        data: response
    })
})

export const getSubmissionResults = asyncHandler(async (req: jwtReq, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user.id;
    
    const response = await handleGetSubmissionResults(userId, submissionId as string);
    return res.status(200).json({
        status: 'success',
        message: 'Submission results fetched successfully',
        data: response
    })
})
