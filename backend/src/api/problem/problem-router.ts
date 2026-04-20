import { Router } from "express";
import { validate } from "../../shared/middleware";
import { createProblemSchema } from "./problem-schema";
import { createProblem, finializeProblem } from "./problem-controller";
import { verifyJWT } from "../../shared/middleware";

const router = Router();

router.post("/create" , validate('body', createProblemSchema), verifyJWT, createProblem);
router.post("/finialize", verifyJWT, finializeProblem);

export default router;