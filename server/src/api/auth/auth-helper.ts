import env from '../../config';
import logger from '../../loaders/logger';
import ApiError from '../../utils/apiError';
import {jwtCookieOptions} from '../../shared/helper';
import { Response } from 'express';

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