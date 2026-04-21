import * as yup from 'yup';
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserJwtPayload, jwtReq } from '../types';
import httpStatus from 'http-status';
import { user as userTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../loaders/postgres';
import env from '../config';

export const validate = (
    location: 'query' | 'body' | 'params',
    schema: yup.ObjectSchema<any>
  ) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        type RequestLocation = 'query' | 'body' | 'params';
  
        let _location: RequestLocation;
  
        switch (location) {
          case 'query':
            _location = 'query';
            break;
          case 'body':
            _location = 'body';
            break;
          case 'params':
            _location = 'params';
            break;
          default:
            throw new Error(`Invalid location: ${location}`);
        }
  
        const validatedData = await schema.validate(req[_location], {
          abortEarly: false,
        });
  
        // Merge validated data back into the original object to avoid "readonly property" errors
        // specifically for req.query which is often a getter in Express/Bun.
        Object.assign(req[_location], validatedData);
  
        next();
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          const errorMessages = error.errors.join(', ');
          return res.status(400).json({ error: errorMessages });
        }
        if (error instanceof Error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(400).json({ error: 'An unknown error occurred' });
      }
    };
  };

  
export const verifyJWT = asyncHandler(async (req: jwtReq, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.token;

        if (!token) {
            throw new ApiError('Unauthorized Request: No token provided', httpStatus.UNAUTHORIZED);
        }

        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as UserJwtPayload;
        const users = await db.select().from(userTable).where(eq(userTable.id, decodedToken.userId));

        if (!users || users.length === 0) {
            throw new ApiError('Invalid Access Token', httpStatus.UNAUTHORIZED);
        }

        req.user = users[0] as any;
        next();
    } catch (error: any) {
        const statusCode = error instanceof ApiError ? error.statusCode : (error.name === 'JsonWebTokenError' ? 401 : 500);
        const message = error instanceof ApiError ? error.message : (error.name === 'JsonWebTokenError' ? 'Invalid token' : 'Internal Server Error');
        
        console.error('JWT Verification Error:', error.message || error);
        
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
});