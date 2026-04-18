import { Router } from 'express';
import { getSubmitJobResponse, getRunJobResult } from './job.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js'

const router = Router();

router.get('/:jobId/get-result/:submissionId', verifyJWT, getSubmitJobResponse);
router.get('/:jobId/get-run-result', verifyJWT, getRunJobResult);

export default router;