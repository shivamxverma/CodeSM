import Redis from 'ioredis';
import env from '../config/index.js';

const redisUrl = env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL must be set in your environment');
}

export const redisClient = new Redis(redisUrl);
