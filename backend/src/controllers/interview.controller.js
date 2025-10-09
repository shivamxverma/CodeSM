import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateQuestions,AnswerScore } from '../../services/interview.service.js';
import redis from '../config/redis.config.js';

const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { role , experience } = req.body;

  const cachedQuestions = await redis.get(`interviewQuestions:${role}:${experience}`);
  if (cachedQuestions) {
    return res.status(200).json(new ApiResponse(200, JSON.parse(cachedQuestions), "Interview questions fetched successfully from cache"));
  }

  if (!role || !experience) {
      throw new ApiError(400, "Role and experience are required");
  }

  const questions = await generateQuestions(role, experience);
  if (!questions) {
    throw new ApiError(500, "Failed to generate interview questions");
  }

  const cacheExpiry = 60 * 60; 
  redis.setex(`interviewQuestions:${role}:${experience}`, cacheExpiry, JSON.stringify(questions));

  res.status(200).json(new ApiResponse(200, "Interview questions generated successfully", questions));
})

const getAnswerScore = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;

  const cachedScore = await redis.get(`answerScore:${question}:${answer}`);
  if (cachedScore) {
    return res.status(200).json(new ApiResponse(200, JSON.parse(cachedScore), "Answer score fetched successfully from cache"));
  }

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const { score, analysis } = await AnswerScore(question, answer);

  const cacheExpiry = 60 * 60;
  redis.setex(`answerScore:${question}:${answer}`, cacheExpiry, JSON.stringify({
    score,
    analysis
  }));

  res.status(200).json(new ApiResponse(200, "Answer scored successfully", { score, analysis }));
});

export {
  generateInterviewQuestions,
  getAnswerScore
};