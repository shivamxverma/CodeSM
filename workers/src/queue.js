import Queue from 'bull';
import env from '../config/index.js';

const redis = env.REDIS_URL;

export const myQueue = new Queue(
  'job-queue',
  typeof redis === 'string' ? redis : { redis }
);