import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { jwtReq } from '../../types';
import ApiError from '../../utils/ApiError';
import {
    handleEmailPasswordRegister
} from './user-service';


export const registerUser = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {

});
