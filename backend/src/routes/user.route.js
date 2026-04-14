import { Router } from "express";
import { registerUser, loginUser, LogoutUser, refreshAccessToken, forgotPassword, resetPassword, setAuthCookies, verifyEmail } from "../controllers/user.controller.js";
import passport from "../config/passport.config.js";
// import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
import env from '../config/index.js';

// Google OAuth entry point
router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get("/auth/google/callback",
    passport.authenticate('google', { session: false, failureRedirect: `${env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        const { accessToken, refreshToken } = req.user;
        setAuthCookies(res, accessToken, refreshToken);
        const client = env.CLIENT_URL || 'http://localhost:5173';
        // Query token still used by SPA for jwtDecode / localStorage; cookies go to API origin with credentials
        res.redirect(`${client}/oauth-success?token=${encodeURIComponent(accessToken)}`);
    }
);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", verifyJWT, LogoutUser);

router.post("/token", refreshAccessToken);

router.post("/verify", verifyEmail);

// ── Password Reset ──────────────────────────────────────────
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;