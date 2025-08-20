import {ApiError} from '../utils/ApiError.js';
import Contest from '../models/contest.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import redis from '../config/redis.config.js';


const getAllContests = asyncHandler(async (req, res) => {
  const cachedContests = await redis.get('allContests');
  if (cachedContests) {
    return res.status(200).json({
      success: true,
      data: JSON.parse(cachedContests),
    });
  }

  const contests = await Contest.find().populate('problems.problem', 'title');

  const cacheExpiry = 60 * 60; 
  redis.setex('allContests', cacheExpiry, JSON.stringify(contests));

  res.status(200).json({
    success: true,
    data: contests,
  });
});

const createContest = asyncHandler(async (req, res) => {
  const { title, description, visibility, durationMinutes, startTime, problems } = req.body;

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

  const cacheExpiry = 60 * 60;
  redis.setex('allContests', cacheExpiry, JSON.stringify(contest));
  
  if (!contest) {
    throw new ApiError(500, 'Something went wrong creating the contest');
  }

  res.status(201).json({
    success: true,
    data: contest,
  });
});

const getContestById = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const cachedContest = await redis.get(`contest:${contestId}`);
  if (cachedContest) {
    return res.status(200).json({
      success: true,
      message: JSON.parse(cachedContest),
    });
  }


  const contest = await Contest.findById(contestId).populate('problems.problem', 'title');

  
  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }
  
  const cacheExpiry = 60 * 60;
  redis.setex(`contest:${contestId}`, cacheExpiry, JSON.stringify(contest)); 

  res.status(200).json({
    success: true,
    message: contest,
  });
});

const getClock = asyncHandler(async (req, res) => { 
  const { contestId } = req.params;
  const cachedContest = await redis.get(`contest:${contestId}`);
  if (cachedContest) {
    const contest = JSON.parse(cachedContest);
    return res.status(200).json({
      now: new Date().toISOString(),
      startTime: contest.startTime,
      endTime: new Date(new Date(contest.startTime).getTime() + contest.durationMinutes * 60 * 1000).toISOString()
    });
  }

  
  if (!contestId) {
    throw new ApiError(400, 'Contest ID is required');
  }
  const contest = await Contest.findById(contestId);
  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }
  const cacheExpiry = 60 * 60;
  redis.setex(`contest:${contestId}`, cacheExpiry, JSON.stringify(contest));

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
  const cachedContest = await redis.get(`contest:${contestId}`);
  if (cachedContest) {
    const contest = JSON.parse(cachedContest);
    const leaderboard = contest.participants.map(p => ({
      user: p.user.username,
      score: p.score,
      problemsSolved: p.problemsSolved
    })).sort((a, b) => b.score - a.score);
    
    return res.status(200).json({
      success: true,
      message: leaderboard,
    });
  }

  const contest = await Contest.findById(contestId).populate('participants.user', 'username');
  
  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }

  const cacheExpiry = 60 * 60;
  redis.setex(`contest:${contestId}`, cacheExpiry, JSON.stringify(contest));

  const leaderboard = contest.participants.map(p => ({
    user: p.user.username,
    score: p.score,
    problemsSolved: p.problemsSolved
  })).sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    message: leaderboard,
  });
})

const registerContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const cachedContest = await redis.get(`contest:${contestId}`);
  if (cachedContest) {
    const contest = JSON.parse(cachedContest);
    if (contest.participants.some(p => p.user === req.user._id)) {
      throw new ApiError(400, 'You are already registered for this contest');
    }
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new ApiError(404, 'Contest not found');
  }

  if (contest.participants.some(p => p.user === req.user)) {
    throw new ApiError(400, 'You are already registered for this contest');
  }

  contest.participants.push(req.user._id);
  await contest.save();

  const cacheExpiry = 60 * 60;
  redis.setex(`contest:${contestId}`, cacheExpiry, JSON.stringify(contest));

  res.status(200).json({
    success: true,
    message: 'Successfully registered for the contest',
  });
});

export { createContest , getAllContests , getContestById , getClock,getLeaderboard,registerContest};