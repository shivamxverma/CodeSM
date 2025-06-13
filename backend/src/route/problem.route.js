import { Router } from "express";
// import { upload } from "../middlewares/multer.middleware.js";
import { createProblem } from "../controllers/problem.controller.js";
const router = Router();

router.post("/createproblem", createProblem);

export default router;