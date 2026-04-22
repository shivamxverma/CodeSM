import { Router } from 'express';
import { generateInterviewQuestions, getAnswerScore } from './interview-controller';
import { verifyJWT } from '../../shared/middleware';
import { validate } from '../../shared/middleware';
import { generateInterviewQuestionsSchema, getAnswerScoreSchema } from './interview-schema';
const router = Router();

router.post('/', validate('body', generateInterviewQuestionsSchema), verifyJWT, generateInterviewQuestions);
router.post('/score', validate('body', getAnswerScoreSchema), verifyJWT, getAnswerScore);

export default router;




