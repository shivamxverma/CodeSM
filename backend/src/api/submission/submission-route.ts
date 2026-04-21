import { Router } from "express";
import { validate, verifyJWT } from "../../shared/middleware";
import { createsubmissionSchema } from "./submission-schema";
import { createSubmission, getSubmissionStatus, getSubmissionResults } from "./submission-controller";

const router = Router();

router.post("/:problemId/:mode", validate('body', createsubmissionSchema), verifyJWT, createSubmission)
router.get("/:submissionId", verifyJWT, getSubmissionStatus);
router.get("/:submissionId/result", verifyJWT, getSubmissionResults);


export default router;

