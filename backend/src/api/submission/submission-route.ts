import { Router } from "express";
import { validate, verifyJWT } from "../../shared/middleware";
import { createSubmissionSchema } from "./submission-schema";
import { createSubmission, getSubmissionStatus, getSubmissionResults, getAllSubmissions } from "./submission-controller";

const router = Router();

router.get("/problem/:problemId", verifyJWT, getAllSubmissions);
router.get("/:submissionId", verifyJWT, getSubmissionStatus);
router.get("/:submissionId/result", verifyJWT, getSubmissionResults);

router.post("/:problemId/:mode", validate('body', createSubmissionSchema), verifyJWT, createSubmission);

export default router;
