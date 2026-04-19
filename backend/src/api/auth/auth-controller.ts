import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { jwtReq } from '../../types';
import ApiError from '../../utils/ApiError';
import {
    handleEmailPasswordRegister,
    verifyEmail as verifyEmailService,
    handleEmailPasswordLogin
} from './auth-service';
import { setAuthCookies } from './auth-helper';


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
