import { Router } from "express";
import { validate, verifyJWT } from "../../shared/middleware";
import { createSubmissionSchema } from "./submission-schema";
import { createSubmission, getSubmissionStatus, getSubmissionResults, getAllSubmissions } from "./submission-controller";

const router = Router();

router.post("/:problemId/:mode", validate('body', createSubmissionSchema), verifyJWT, createSubmission)
router.get("/:submissionId", verifyJWT, getSubmissionStatus);
router.get("/:submissionId/result", verifyJWT, getSubmissionResults);

router.get("/problem/:problemId", verifyJWT, getAllSubmissions);

export default router;
