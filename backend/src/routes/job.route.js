import { Router } from 'express';
import { getJobResponse } from '../controllers/job.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router();

router.get('/:jobId', verifyJWT, getJobResponse);

export default router;