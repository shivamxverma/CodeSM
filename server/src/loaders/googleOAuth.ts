import env from '../config';
import { OAuth2Client } from 'google-auth-library';

export let googleOAuthClient: OAuth2Client;

export const loadGoogleOAuthClient = async () => {
  googleOAuthClient = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
};