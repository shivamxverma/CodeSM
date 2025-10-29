import jwt from 'jsonwebtoken';
import env from '../config';
import { UserJwtPayload } from '../types';

const getAccessTokenSecret = () => env.JWT_SECRET as string;
const getRefreshTokenSecret = () => env.JWT_REFRESH_SECRET as string;

export const generateToken = (payload: UserJwtPayload) => {
  return jwt.sign(payload, getAccessTokenSecret(), {
    expiresIn: '30d',
  });
};

export const generateRefreshToken = (payload: UserJwtPayload) => {
  return jwt.sign(payload, getRefreshTokenSecret(), {
    expiresIn: '1y',
  });
};

export const generateTokenPair = (payload: UserJwtPayload) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getAccessTokenSecret());
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getRefreshTokenSecret());
};

export const validateRefreshToken = (
  token: string,
): { userId: string; userType: string } | null => {
  try {
    const decoded = verifyRefreshToken(token) as UserJwtPayload;

    return {
      userId: decoded.userId,
      userType: decoded.userType,
    };
  } catch (error) {
    return null;
  }
};