import Queue from 'bull';
import dotenv from 'dotenv';
import env from '../config';

const redis : string = env.REDIS_URL;    

export const myQueue = new Queue(
  'job-queue',
  redis
);