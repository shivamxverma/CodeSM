import { Router } from "express";
import { validate } from '../../shared/middleware';
import { emailPasswordRegister , verifyEmail, emailPasswordLogin,initiateGoogleAuth, googleOAuthCallback, getCurrentUser } from './auth-controller'
import { verifyJWT } from "../../shared/middleware";
import { emailPasswordLoginSchema, emailPasswordRegisterSchema } from "./auth-schema";
const router = Router();

router.post("/register", validate('body', emailPasswordRegisterSchema), emailPasswordRegister);
router.get("/verify-email", verifyEmail);
router.post("/login", validate('body', emailPasswordLoginSchema), emailPasswordLogin);

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', googleOAuthCallback);
router.get("/me", verifyJWT, getCurrentUser);

export default router;