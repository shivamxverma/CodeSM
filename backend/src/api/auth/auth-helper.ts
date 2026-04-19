import * as bcrypt from 'bcryptjs';
import { RefreshTokenResponse } from './auth-types';
import { jwtCookieOptions } from '../../shared/helper';
import { Request, Response } from "express";


export const comparePassword = async (password: string, compareHash: string) => {
    return await bcrypt.compare(password, compareHash);
}

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

export const setAuthCookies = (
    res: Response,
    response: RefreshTokenResponse,
    origin: string,
): Omit<typeof response, 'accessToken' | 'refreshToken'> => {
    if (response.accessToken) {
        res.cookie('token', response.accessToken, jwtCookieOptions(origin, false));
    }

    if (response.refreshToken) {
        res.cookie(
            'refreshToken',
            response.refreshToken,
            jwtCookieOptions(origin, true),
        );
    }

    const {
        accessToken: accessToken2,
        refreshToken: refreshToken2,
        ...responseData
    } = response;

    return responseData;
}