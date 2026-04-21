import { Router } from "express";
import { validate } from "../../shared/middleware";
import { createProblemSchema, getProblemsSchema } from "./problem-schema";
import { createProblem, finalizeProblem, getProblems, getProblemById, getEditorialSolution } from "./problem-controller";
import { verifyJWT } from "../../shared/middleware";

const router = Router();

router.post("/create" , validate('body', createProblemSchema), verifyJWT, createProblem);
router.post("/finalize", verifyJWT, finalizeProblem);
router.get('/', validate('query', getProblemsSchema), verifyJWT, getProblems);
router.get('/:problemId', verifyJWT, getProblemById);
router.get('/:problemId/editorial-solution', verifyJWT, getEditorialSolution);
// router.get('/:problemId/editorial-content', verifyJWT, getEditorialContent);
// router.get('/:problemId/hints', verifyJWT, getHints);

export default router;