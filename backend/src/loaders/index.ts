import express from './express';
import logger from './logger';
import Express from 'express';
import { getDrizzleClient } from './postgres';

export default async ({
    expressApp
} : {
    expressApp : Express.Application;
}) : Promise<void> => {
    express({ app : expressApp })
    await getDrizzleClient();
    logger.info('🛡️  Database loaded  🛡️')
    logger.info('🛡️  Express loaded  🛡️');
    logger.info('🛡️  All modules loaded!  🛡️');
}