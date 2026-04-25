import { Router } from "express";
import { validate } from "../../shared/middleware";
import { createProblemSchema, getProblemsSchema } from "./problem-schema";
import { createProblem, finalizeProblem, getProblems, getProblemById, getEditorialSolution, getEditorialContent , getHints} from "./problem-controller";
import { verifyJWT } from "../../shared/middleware";

const router = Router();

router.post("/create" , validate('body', createProblemSchema), verifyJWT, createProblem);
router.post("/finalize", verifyJWT, finalizeProblem);
router.get('/', validate('query', getProblemsSchema), getProblems);
router.get('/:problemId', getProblemById);
router.get('/:problemId/editorial-solution', getEditorialSolution);
router.get('/:problemId/editorial-content', getEditorialContent);
router.get('/:problemId/hints', getHints);

export default router;