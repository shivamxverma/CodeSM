import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { db } from "../loaders/postgres";
import { user as userTable } from "../db/schema";
import { eq } from "drizzle-orm";

type AccessTokenPayload = JwtPayload & { userId?: string };

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : (req as any).cookies?.token;

      if (!token) {
        throw new ApiError("Unauthorized Request: No token provided", 401);
      }

      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        throw new ApiError("Server misconfiguration: ACCESS_TOKEN_SECRET missing", 500);
      }

      const decodedToken = jwt.verify(token, secret) as AccessTokenPayload;
      const userId = decodedToken?.userId;
      if (!userId) {
        throw new ApiError("Invalid Access Token", 401);
      }

      const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

      if (users.length === 0) {
        throw new ApiError("Invalid Access Token", 401);
      }

      const user = users[0];

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