import env from '../config/index.js';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import UserToken from '../models/token.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '../services/email/email.js';
import { sendVerificationEmail } from '../services/email/verification.js';
import { v4 as uuidv4 } from 'uuid';

/** Shared with Google OAuth callback — keep login + OAuth cookie behavior identical. */
export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'Strict',
};

export function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('accessToken', accessToken, AUTH_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, AUTH_COOKIE_OPTIONS);
}

const generateAccessTokenAndRefreshToken = async (user) => {

    try {

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: env.ACCESS_TOKEN_EXPIRY || '1d',
            }
        );
        const refreshToken = jwt.sign(
            {
                _id: user._id,
                role: user.role,
            },
            env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: env.REFRESH_TOKEN_EXPIRY || '7d',
            }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // if(!['user','author','admin'].includes(role.toLowerCase())){
    //     throw new ApiError(400,"Role is Invalid");
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
        throw new ApiError(500, "Something Went Wrong While Hashing Password");
    }

    const ExistedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (ExistedUser) {
        throw new ApiError(409, "Username or Email already exists");
    }


    const user = await User.create({
        username: username,
        email,
        fullName,
        password: hashedPassword,
    });

    const CreatedUser = await User.findById(user._id).select("-password -refreshToken");

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    const emailVerificationToken = uuidv4();

    const user_token = await UserToken.create({
        user: user,
        token: emailVerificationToken,
        tokenType: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    if(!user_token) {
        throw new ApiError(500, "User Token is not stored into db");
    }
    
    await sendVerificationEmail(email, emailVerificationToken);

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email && !password) {
        throw new ApiError(400, 'Username or Email is Required');
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User doesn't Exist");
    }

    if(!user.emailVerified) {
        throw new ApiError(400, "Email Verification is required");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);


    if (!accessToken || !refreshToken) {
        throw new ApiError(500, 'Failed to generate tokens');
    }

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    res.status(200);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            'User Logged In Successfully'
        )
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", AUTH_COOKIE_OPTIONS)
        .clearCookie("refreshToken", AUTH_COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!incomingRefreshToken) {
        return res.status(401).json({ message: "Unauthorized request" });
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({ message: "Refresh token expired or used" });
        }

        // const accessToken = await generateAccessTokenAndRefreshToken(user._id, user.role);

        // user.refreshToken = refreshToken;
        // await user.save({ validateBeforeSave: false });

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({ accessToken, refreshToken });
    } catch (error) {
        return res.status(401).json({ message: error.message || "Invalid refresh token" });
    }
});


/**
 * POST /api/v1/users/forgot-password
 * Body: { email }
 * Generates a secure reset token, stores its hash in DB, and emails the user a link.
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond OK to prevent email enumeration attacks
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, 'If an account with that email exists, a reset link has been sent.')
        );
    }

    // Generate a random 32-byte token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash before storing — never store the raw token in DB
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build the frontend reset URL with the RAW token (not hashed)
    const clientUrl = env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    try {
        await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
        console.error("Nodemailer Error:", err);
        // If email fails, clear the token so user can try again
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, 'Failed to send reset email. Please try again later.');
    }

    return res.status(200).json(
        new ApiResponse(200, {}, 'If an account with that email exists, a reset link has been sent.')
    );
});

/**
 * POST /api/v1/users/reset-password/:token
 * Body: { password, confirmPassword }
 * Verifies the token, checks expiry, updates the password.
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
        throw new ApiError(400, 'Reset token is missing');
    }

    if (!password || !confirmPassword) {
        throw new ApiError(400, 'Password and confirm password are required');
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, 'Passwords do not match');
    }

    if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    // Hash the incoming raw token to compare with what's stored
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }, // must not be expired
    });

    if (!user) {
        throw new ApiError(400, 'Reset link is invalid or has expired. Please request a new one.');
    }

    // Update password and clear the reset token fields
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    // Also invalidate existing sessions
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, 'Password reset successfully. You can now log in with your new password.')
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const userToken = await UserToken.findOne({
    token : token,
    tokenType: 'EMAIL_VERIFY',
    expiresAt: { $gt: new Date() }
  }).populate('user');

  if (!userToken) {
    throw new ApiError(404, 'Invalid or expired token');
  }

  if (!userToken.user) {
    throw new ApiError(404, 'User not found');
  }

  await User.findByIdAndUpdate(userToken.user._id, {
    emailVerified: true
  });

  await UserToken.findByIdAndDelete(userToken._id);

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now login.',
  });
});

export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    verifyEmail
};
