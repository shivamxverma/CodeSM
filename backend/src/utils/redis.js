import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL must be set in your environment');
}

export const redisClient = new Redis(redisUrl);
