import {ApiError} from '../utils/ApiError.js';
import Contest from '../models/contest.model.js';
import asyncHandler from '../utils/asyncHandler.js';


const getAllContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find().populate('problems.problem', 'title');
  res.status(200).json({
    success: true,
    data: contests,
  });
});

const createContest = asyncHandler(async (req, res) => {
  const { title, description, visibility, durationMinutes, startTime, problems } = req.body;

  console.log(req.body);

  if (
    !title ||
    !description ||
    !visibility ||
    !durationMinutes ||
    !startTime ||
    !Array.isArray(problems) ||
    problems.length === 0 ||
    problems.some(
      p => !p.problem || !p.index || !p.points
    )
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  const contest = await Contest.create({
    title,
    description,
    startTime,
    durationMinutes,
    visibility,
    problems: problems.map(p => ({
      problem: p.problem,
      index: p.index || "",
      points: Number(p.points || 0)
    })),
    author: req.user,
  });

  res.status(201).json({
    success: true,
    data: contest,
  });
});

const getContestById = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId).populate('problems.problem', 'title');

  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }

  res.status(200).json({
    success: true,
    data: contest,
  });
});

const getClock = asyncHandler(async (req, res) => { 
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId);
  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }
  const startTime = new Date(contest.startTime);
  const durationMinutes = contest.durationMinutes; 
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  res.status(200).json({
    now: new Date().toISOString(),       
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()      
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId).populate('participants.user', 'username');
  
  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }

  const leaderboard = contest.participants.map(p => ({
    user: p.user.username,
    score: p.score,
    problemsSolved: p.problemsSolved
  })).sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    data: leaderboard,
  });
})

export { createContest , getAllContests , getContestById , getClock};