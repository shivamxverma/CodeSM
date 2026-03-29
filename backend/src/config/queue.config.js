import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const redis =
  process.env.REDIS_URL ??
  { host: '127.0.0.1', port: 6379 };

export const myQueue = new Queue(
  'job-queue',
  typeof redis === 'string' ? redis : { redis }
);