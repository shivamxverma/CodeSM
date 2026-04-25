import express from './express';
import logger from './logger';
import Express from 'express';
import { getDrizzleClient } from './postgres';
import { loadGoogleOAuthClient } from './googleOAuth';

export default async ({
    expressApp
} : {
    expressApp : Express.Application;
}) : Promise<void> => {
    await getDrizzleClient();
    logger.info('🛡️  Database loaded  🛡️')
    express({ app : expressApp })
    logger.info('🛡️  Express loaded  🛡️');
    await loadGoogleOAuthClient();
    logger.info('🛡️  Google OAuth loaded  🛡️')
    logger.info('🛡️  All modules loaded!  🛡️');
}