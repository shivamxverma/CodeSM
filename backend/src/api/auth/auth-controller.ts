import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { jwtReq } from '../../types';
import ApiError from '../../utils/ApiError';
import {
    handleEmailPasswordRegister,
    verifyEmail as verifyEmailService,
    handleEmailPasswordLogin,
    handleGoogleOauth
} from './auth-service';
import { setAuthCookies } from './auth-helper';
import { isAllowedOrigin, buildGoogleAuthUrl, verifyOAuthState } from '../../loaders/googleOAuth';


export const emailPasswordRegister = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    const response = await handleEmailPasswordRegister(req.body);

    res.status(httpStatus.CREATED).json({
        success : true,
        message : response.message,
    })
});

export const verifyEmail = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Verification token is required',
        });
    }

    await verifyEmailService(token);

    res.status(httpStatus.CREATED).json({
        success : true,
        message : 'Email verified successfully. You can now login.',
    })
});

export const emailPasswordLogin = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    const response = await handleEmailPasswordLogin(req.body);

    const origin = req.headers.origin || req.headers.referer || '';

    const responseData = setAuthCookies(res, response, origin);

    res.status(httpStatus.OK).json({
        success : true,
        message : "Login successful",
        data : responseData,
    })
})

export const initiateGoogleAuth = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    // verify origin 
    const headerOrigin = (req.headers.origin as string | undefined) || undefined;
    const queryOrigin = (req.query.origin as string | undefined) || undefined;
    const chosenOrigin = queryOrigin || headerOrigin || '';
    
    if (!isAllowedOrigin(chosenOrigin)) {
        return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Origin not allowed',
        });
    }
    
    const authUrl = buildGoogleAuthUrl(chosenOrigin);
    res.redirect(authUrl);
})

export const googleOAuthCallback = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!code || !state) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Missing code or state',
        });
    }

    const { origin } = verifyOAuthState(state);
    const response = await handleGoogleOauth({ isVerify: false, code, credential: '' });
    setAuthCookies(res, response, origin);
    const redirectUrl = `${origin}/oauth-success`;
    res.redirect(302, redirectUrl);
})

export const getCurrentUser = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'User not found or not authenticated',
        });
    }

    res.status(httpStatus.OK).json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    });
});
