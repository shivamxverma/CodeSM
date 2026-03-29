import { Router } from 'express';
import { getJobResponse , getRunJobResponse, getSubmitJobResponse } from '../controllers/job.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router();

router.get('/:jobId/problems/:problemId', verifyJWT, getJobResponse);
router.get('/:jobId/submissions/:submissionId/dry-run', verifyJWT, getRunJobResponse);
router.get('/:jobId/get-result/:submissionId', verifyJWT, getSubmitJobResponse);

export default router;