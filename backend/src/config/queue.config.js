import Queue from 'bull';
import dotenv from 'dotenv';
import env from './index.js';

const redis = env.REDIS_URL;

export const myQueue = new Queue(
  'job-queue',
  typeof redis === 'string' ? redis : { redis }
);