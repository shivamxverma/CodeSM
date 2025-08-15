import {createContest,getAllContests,getContestById,getClock} from "../controllers/contest.controller.js"
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/", verifyJWT, createContest);
router.get("/", getAllContests);
router.get("/:contestId", getContestById); 
router.get("/:contestId/clock",getClock);
router.get("/:contestId/leaderboard", getContestById); // Assuming you have a controller for leaderboard

export default router;