import ApiError from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import asyncHandler from '../../utils/asyncHandler';
import { generateQuestions, AnswerScore } from './interview-service';
import redis from '../../loaders/redis';
import { Request,Response } from 'express';
import status from 'http-status';

export const generateInterviewQuestions = asyncHandler(async (req:Request, res:Response) => {
  const { role , experience } = req.body;

  const questions = await generateQuestions(role, experience);

  res.status(status.OK)
    .json(new ApiResponse(
        status.OK, 
        "Interview questions generated successfully", 
        questions
    ));
})

export const getAnswerScore = asyncHandler(async (req:Request, res:Response) => {
  const { question, answer } = req.body;

  const cachedScore = await redis.get(`answerScore:${question}:${answer}`);
  if (cachedScore) {
    return res.status(status.OK).json(new ApiResponse(status.OK, JSON.parse(cachedScore), "Answer score fetched successfully from cache"));
  }

  const { score, analysis } = await AnswerScore(question, answer);

  const cacheExpiry = 60 * 60;
  redis.setex(`answerScore:${question}:${answer}`, cacheExpiry, JSON.stringify({
    score,
    analysis
  }));

  res.status(200).json(new ApiResponse(200, "Answer scored successfully", { score, analysis }));
});