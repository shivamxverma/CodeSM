import { JWT_TOKEN_MAX_AGE } from "./constants";
import { CookieOptions } from 'express';

export const jwtCookieOptions = (origin: string, isRefreshToken: boolean) => {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            domain: 'localhost:3000',
            maxAge: isRefreshToken
                ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
                : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
            path : '/',
        } as CookieOptions ;
    } else {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: 'localhost:3000',
            maxAge: isRefreshToken
                ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
                : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
            path : '/',
        } as CookieOptions ;
    }
}