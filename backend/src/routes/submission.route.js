import {Router} from 'express';
import {createSubmission,getSubmissionById} from '../controllers/submission.controller.js';
import { rateLimitMiddleware } from '../middlewares/ratelimiter.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:problemId',verifyJWT,rateLimitMiddleware, createSubmission);
router.get('/problem/:problemId',verifyJWT, rateLimitMiddleware, getSubmissionById);

export default router;