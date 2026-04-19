import jwt from 'jsonwebtoken';
import env from 'src/config';
import {UserJwtPayload} from '../types';


const getAccessTokenSecret = () => env.ACCESS_TOKEN_SECRET as string;

const getRefreshTokenSecret = () => env.REFRESH_TOKEN_SECRET as string;

export const generateRefreshToken = (payload: UserJwtPayload) => {
  return jwt.sign(payload, getRefreshTokenSecret(), {
    expiresIn: '1y',
  });
};

export const generateToken = (Payload : UserJwtPayload) => {
    return jwt.sign(Payload,getAccessTokenSecret(),{
        expiresIn: '30d',
    });
}

export const generateTokenPair = (payload: UserJwtPayload) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};