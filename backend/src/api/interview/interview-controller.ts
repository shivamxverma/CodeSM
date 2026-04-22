import ApiError from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import asyncHandler from '../../utils/asyncHandler';
import { generateQuestions, AnswerScore } from './interview-service';
import redis from '../../loaders/redis';
import { Request,Response } from 'express';
import status from 'http-status';

export const generateInterviewQuestions = asyncHandler(async (req:Request, res:Response) => {
  const response = await generateQuestions(req.body);

  res.status(status.OK)
    .json(new ApiResponse(
        status.OK, 
        "Interview questions generated successfully", 
        response
    ));
})

export const getAnswerScore = asyncHandler(async (req:Request, res:Response) => {
  const response = await AnswerScore(req.body);

  res.status(status.OK)
    .json(new ApiResponse(
        status.OK, 
        "Answer scored successfully", 
        response
    ));
})
