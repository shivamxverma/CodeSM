import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/apiError';
import env from '../../config';
import { UserType, RefreshTokenResponse } from './auth-types';
import { generateTokenPair, validateRefreshToken } from '../../shared/jwt';

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const verifyHashPassword = async (
    password : string,
    userPassword : string
) : Promise<boolean> => {
    try {
        const isPasswordValid = await bcrypt.compare(password, userPassword);
        return isPasswordValid;
    }catch(error){
        throw new Error("Error when checking password");
    }
}

export const handleRefreshToken = (
    refreshTokenValue: string,
): RefreshTokenResponse => {

    const tokenData = validateRefreshToken(refreshTokenValue);

    if (!tokenData) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Invalid or expired refresh token',
        );
    }

    const tokenPayload = {
        userId: tokenData.userId,
        userType: tokenData.userType,
        lastLogin: new Date(),
    };

    const {accessToken,refreshToken} = generateTokenPair(tokenPayload);

    return {
        accessToken,
        refreshToken
    }

}

