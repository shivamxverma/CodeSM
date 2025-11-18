import {Router} from 'express';
import {generateInterviewQuestions,getAnswerScore} from '../controllers/interview.controller.js';
const router = Router();

router.post('/', generateInterviewQuestions);
router.post('/score', getAnswerScore);

export default router;




