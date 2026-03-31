import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const redis = process.env.REDIS_URL;

export const myQueue = new Queue(
  'job-queue',
  typeof redis === 'string' ? redis : { redis }
);