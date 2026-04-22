import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateQuestions,AnswerScore } from '../services/interview.service.js';
import redis from '../config/redis.config.js';
import crypto from 'crypto';

const ALLOWED_LEVELS = new Set(['easy', 'medium', 'hard', 'mixed']);
const ALLOWED_ROUNDS = new Set(['technical', 'behavioral', 'lld', 'system_design']);

const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const {
    role,
    experience,
    customRequirements = '',
    questionCount = 10,
    interviewLevel = 'medium',
    round = 'technical',
    codingLanguage = '',
  } = req.body;

  const customKey = customRequirements.trim().toLowerCase() || 'default';
  const qCount = Math.min(Math.max(parseInt(String(questionCount), 10) || 10, 3), 25);
  const level = ALLOWED_LEVELS.has(String(interviewLevel)) ? String(interviewLevel) : 'medium';
  const roundType = ALLOWED_ROUNDS.has(String(round)) ? String(round) : 'technical';
  const langKey =
    (roundType === 'technical' || roundType === 'lld') && String(codingLanguage).trim()
      ? String(codingLanguage).trim().toLowerCase()
      : 'na';

  const cacheKey = `interviewQuestions:${role?.id}:${experience?.id}:q${qCount}:lvl${level}:r${roundType}:lang${langKey}:${customKey}`;

  const cachedQuestions = await redis.get(cacheKey);
  if (cachedQuestions) {
    return res.status(200).json(new ApiResponse(200, "Interview questions fetched successfully from cache", JSON.parse(cachedQuestions)));
  }

  if (!role || !experience) {
      throw new ApiError(400, "Role and experience are required");
  }

  const questions = await generateQuestions(role, experience, {
    customRequirements,
    questionCount: qCount,
    interviewLevel: level,
    round: roundType,
    codingLanguage: langKey !== 'na' ? langKey : undefined,
  });
  if (!questions) {
    throw new ApiError(500, "Failed to generate interview questions");
  }

  const cacheExpiry = 60 * 60;
  redis.setex(cacheKey, cacheExpiry, JSON.stringify(questions));

  res.status(200).json(new ApiResponse(200, "Interview questions generated successfully", questions));
})

const getAnswerScore = asyncHandler(async (req, res) => {
  const { question, answer, round = '', codingLanguage = '' } = req.body;
  const roundType = ALLOWED_ROUNDS.has(String(round)) ? String(round) : '';
  const langPart = String(codingLanguage || '').trim().toLowerCase();
  const answerCacheHash = crypto
    .createHash('sha256')
    .update(`${question || ''}:${answer || ''}:r${roundType || 'na'}:lang${langPart || 'na'}`)
    .digest('hex');
  const answerCacheKey = `answerScore:${answerCacheHash}`;

  const cachedScore = await redis.get(answerCacheKey);
  if (cachedScore) {
    return res.status(200).json(new ApiResponse(200, "Answer score fetched successfully from cache", JSON.parse(cachedScore)));
  }

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const { score, analysis } = await AnswerScore(question, answer, {
    round: roundType || undefined,
    codingLanguage: langPart || undefined,
  });

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
