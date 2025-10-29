import env from '../../config';
import logger from '../../loaders/logger';
import ApiError from '../../utils/apiError';
import {jwtCookieOptions} from '../../shared/helper';
import { TokenPayload } from 'google-auth-library';
import { Response } from 'express';
import { googleOAuthClient } from '../../loaders/googleOAuth';

import {
  RefreshTokenResponse,
} from './auth-types';

export const setAuthCookies = (
    res: Response,
    response:
        | RefreshTokenResponse,
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

export const verifyGoogleCredentials = async (
  code?: string,
  credential?: string,
): Promise<{ credentialPayload: TokenPayload; oidcToken: string }> => {
  let credentialPayload: TokenPayload;
  let oidcToken: string;

  try {
    if (credential) {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      credentialPayload = ticket.getPayload() as TokenPayload;
      oidcToken = credential;
    } else if (code) {
      const { tokens } = await googleOAuthClient.getToken(code);
      if (!tokens.id_token) {
        throw new Error('No ID token received from Google');
      }
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      credentialPayload = ticket.getPayload() as TokenPayload;
      oidcToken = tokens.id_token;
    } else {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'No valid authentication provided',
      );
    }

    if (!credentialPayload?.sub) {
      throw new ApiError(httpStatus.UNAUTHORIZED,'Invalid credential payload', );
    }

    return { credentialPayload, oidcToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const errorMessage = credential
      ? 'Invalid credential token'
      : 'Invalid authorization code';
    logger.error(`${errorMessage}:`, error);
    throw new ApiError(httpStatus.UNAUTHORIZED,errorMessage);
  }
};