import {Router} from 'express';
import {createSubmission,getAllSubmissionById} from '../controllers/submission.controller.js';
import { rateLimitMiddleware } from '../middlewares/ratelimiter.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:problemId', verifyJWT, rateLimitMiddleware,getAllSubmissionById);

router.post('/:problemId', verifyJWT, rateLimitMiddleware, (req, res, next) => {
    const isDryRun = req.query.dryRun === 'true';
    req.isDryRun = isDryRun;
    createSubmission(req, res, next);
});

export default router;