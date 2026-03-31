import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { jwtReq } from '../../types';
import ApiError from '../../utils/ApiError';
import {
    handleEmailPasswordRegister,
    verifyEmail as verifyEmailService
} from './user-service';


export const emailPasswordRegister = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    console.log("Hey i am here in register");
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



    res.status(httpStatus.CREATED).json({
        success : true,
        message : 'Email verified successfully. You can now login.',
    })
});