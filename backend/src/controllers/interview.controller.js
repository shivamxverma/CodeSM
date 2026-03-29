import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateQuestions,AnswerScore } from '../../services/interview.service.js';
import redis from '../config/redis.config.js';
import crypto from 'crypto';

const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { role, experience, customRequirements = '' } = req.body;
  const customKey = customRequirements.trim().toLowerCase() || 'default';

  const cachedQuestions = await redis.get(`interviewQuestions:${role?.id}:${experience?.id}:${customKey}`);
  if (cachedQuestions) {
    return res.status(200).json(new ApiResponse(200, "Interview questions fetched successfully from cache", JSON.parse(cachedQuestions)));
  }

  if (!role || !experience) {
      throw new ApiError(400, "Role and experience are required");
  }

  const questions = await generateQuestions(role, experience, customRequirements);
  if (!questions) {
    throw new ApiError(500, "Failed to generate interview questions");
  }

  const cacheExpiry = 60 * 60; 
  redis.setex(`interviewQuestions:${role.id}:${experience.id}:${customKey}`, cacheExpiry, JSON.stringify(questions));

  res.status(200).json(new ApiResponse(200, "Interview questions generated successfully", questions));
})

const getAnswerScore = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  const answerCacheHash = crypto
    .createHash('sha256')
    .update(`${question || ''}:${answer || ''}`)
    .digest('hex');
  const answerCacheKey = `answerScore:${answerCacheHash}`;

  const cachedScore = await redis.get(answerCacheKey);
  if (cachedScore) {
    return res.status(200).json(new ApiResponse(200, "Answer score fetched successfully from cache", JSON.parse(cachedScore)));
  }

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const { score, analysis } = await AnswerScore(question, answer);

  const cacheExpiry = 60 * 60;
  redis.setex(answerCacheKey, cacheExpiry, JSON.stringify({
    score,
    analysis
  }));

  res.status(200).json(new ApiResponse(200, "Answer scored successfully", { score, analysis }));
});

export {
  generateInterviewQuestions,
  getAnswerScore
};