import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateQuestions,AnswerScore } from '../../services/interview.service.js';

// 10 Interview Question Generation 

const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { role , experience } = req.body;

  // Example of Role :  { id: 'frontend', name: 'Frontend Developer', desc: 'React, Vue, Angular', icon: '💻' },
  // Example of Experience : { id: 'entry', name: 'Entry Level', years: '0-1 years' },

    if (!role || !experience) {
       throw new ApiError(400, "Role and experience are required");
    }

  const questions = await generateQuestions(role, experience);
  if (!questions) {
    throw new ApiError(500, "Failed to generate interview questions");
  }
  res.status(200).json(new ApiResponse(200, "Interview questions generated successfully", questions));
})

const getAnswerScore = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const { score, analysis } = await AnswerScore(question, answer);

  res.status(200).json(new ApiResponse(200, "Answer scored successfully", { score, analysis }));
});

export {
  generateInterviewQuestions,
  getAnswerScore
};