import {Router} from 'express';
import {createSubmission,getAllSubmissionById,runCode} from './submission.controller.js';
import { rateLimitMiddleware } from '../../middlewares/ratelimiter.middleware.js';
import {verifyJWT} from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/:problemId', verifyJWT, rateLimitMiddleware,getAllSubmissionById);

router.post('/:problemId/run', verifyJWT, rateLimitMiddleware, runCode);

router.post('/:problemId/submit', verifyJWT, rateLimitMiddleware, createSubmission);

export default router;