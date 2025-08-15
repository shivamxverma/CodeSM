import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Author from '../models/author.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, 'Unauthorized Request: No token provided');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userRole = decodedToken?.role;
        const user = userRole === "AUTHOR" ?
          await Author.findById(decodedToken?._id).select('-password -refreshToken')
          : await User.findById(decodedToken?._id).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Access Token');
        }

        req.user = user;
        next();
    } catch (error) {
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        const message = error instanceof ApiError ? error.message : 'Internal Server Error';
        console.error('JWT Verification Error:', error.message);
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
});