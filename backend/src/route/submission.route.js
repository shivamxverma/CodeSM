import {Router} from 'express';
import {createSubmission} from '../controllers/submission.controller.js';

const router = Router();

router.post('/submit', createSubmission);

export default router;