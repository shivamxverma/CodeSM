import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import User from "../models/user.model.js";

type AccessTokenPayload = JwtPayload & { _id?: string };

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : (req as any).cookies?.accessToken;

      if (!token) {
        throw new ApiError("Unauthorized Request: No token provided", 401);
      }

      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        throw new ApiError("Server misconfiguration: ACCESS_TOKEN_SECRET missing", 500);
      }

      const decodedToken = jwt.verify(token, secret) as AccessTokenPayload;
      const userId = decodedToken?._id;
      if (!userId) {
        throw new ApiError("Invalid Access Token", 401);
      }

      const user = await User.findById(userId).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError("Invalid Access Token", 401);
      }

      (req as any).user = user;
      next();
    } catch (error) {
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const message =
        error instanceof ApiError ? error.message : "Internal Server Error";
      console.error(
        "JWT Verification Error:",
        error instanceof Error ? error.message : String(error)
      );
      return res.status(statusCode).json({
        status: "error",
        message,
      });
    }
  }
);