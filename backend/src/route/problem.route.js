import { Router } from "express";
import {uploadFile}  from "../middlewares/multer.middleware.js";
import { createProblem ,getProblemById} from "../controllers/problem.controller.js";
const router = Router();

router.post("/createproblem", uploadFile.single('testcases'), createProblem);
router.get("/:id", getProblemById);

export default router;