import env from '../config';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export let googleOAuthClient: OAuth2Client;

export const loadGoogleOAuthClient = async () => {
  googleOAuthClient = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
};

const getAllowedOrigins = (): string[] => {
  if (env.NODE_ENV === 'production') {
    return env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : [];
  }

  // Development defaults
  return ['http://localhost:3000', 'https://dev.verlyai.xyz', 'https://verlyai.xyz', 'http://localhost:5173'];
};

export const isAllowedOrigin = (origin?: string | null): origin is string => {
  if (!origin || typeof origin !== 'string') return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
};

type OAuthStatePayload = {
  origin: string;
  nonce: string;
};

export const signOAuthState = (payload: OAuthStatePayload): string => {
  return jwt.sign(payload, env.JWT_SECRET as string, { expiresIn: '10m' });
};

export const verifyOAuthState = (state: string): OAuthStatePayload => {
  const decoded = jwt.verify(state, env.JWT_SECRET as string) as OAuthStatePayload;
  if (!isAllowedOrigin(decoded.origin)) {
    throw new Error('Invalid origin in OAuth state');
  }
  return decoded;
};

export const buildGoogleAuthUrl = (origin: string): string => {
  if (!isAllowedOrigin(origin)) {
    throw new Error('Origin not allowed');
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const state = signOAuthState({ origin, nonce });

  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    state,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
  });
};
