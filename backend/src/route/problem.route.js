import { Router } from "express";
import {uploadFile}  from "../middlewares/multer.middleware.js";
import { createProblem ,getProblemById , getAllProblems} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/createproblem",verifyJWT, uploadFile.single('testcases'), createProblem);
router.get("/:id", getProblemById);
router.get("/", getAllProblems);

export default router;