import {Router} from 'express';
import {createSubmission,getSubmissionById} from '../controllers/submission.controller.js';
import { rateLimitMiddleware } from '../middlewares/ratelimiter.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:problemId', verifyJWT, rateLimitMiddleware, (req, res, next) => {
    // Check for dryRun query param
    const isDryRun = req.query.dryRun === 'true';
    // Attach dryRun info to request for controller
    req.isDryRun = isDryRun;
    createSubmission(req, res, next);
});
router.get('/problem/:problemId',verifyJWT, rateLimitMiddleware, getSubmissionById);

export default router;