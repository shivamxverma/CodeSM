import {Router} from 'express';
import {createSubmission} from '../controllers/submission.controller.js';
import { rateLimitMiddleware } from '../middlewares/ratelimiter.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:problemId',verifyJWT,rateLimitMiddleware, createSubmission);

export default router;