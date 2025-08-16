import {createContest,getAllContests,getContestById,getClock,getLeaderboard,registerContest} from "../controllers/contest.controller.js"
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/", verifyJWT, createContest);
router.get("/", getAllContests);
router.get("/:contestId", getContestById); 
router.get("/:contestId/clock",getClock);
router.get("/:contestId/leaderboard",verifyJWT, getLeaderboard); 
router.post("/:contestId/register", verifyJWT,registerContest);

export default router;