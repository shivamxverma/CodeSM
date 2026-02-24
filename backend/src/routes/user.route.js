import { Router } from "express";
import { registerUser, loginUser, LogoutUser, refreshAccessToken, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import passport from "../config/passport.config.js";
// import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// Google OAuth entry point
router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get("/auth/google/callback",
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        const { accessToken } = req.user;
        // Pass token via URL so the frontend can store it in localStorage
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth-success?token=${accessToken}`);
    }
);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", verifyJWT, LogoutUser);

router.post("/token", refreshAccessToken);

// ── Password Reset ──────────────────────────────────────────
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;