import { CookieOptions } from 'express';
import { JWT_TOKEN_MAX_AGE } from './constants';

export const jwtCookieOptions = (origin: string, isRefreshToken: boolean) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: '.verlyai.xyz',
      maxAge: isRefreshToken
        ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
        : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
      path: '/',
    } as CookieOptions;
  }

  // Development mode - no domain for localhost compatibility
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    // domain is omitted in dev mode to work with localhost
    maxAge: isRefreshToken
      ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
      : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
  } as CookieOptions;
};