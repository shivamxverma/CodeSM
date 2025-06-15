import {Router} from 'express';
import {createSubmission} from '../controllers/submission.controller.js';
// import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:problemId', createSubmission);

export default router;