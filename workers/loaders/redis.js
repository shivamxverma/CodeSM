import Redis from 'ioredis';
import env from '../config/index.js';

const redisUrl = env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL must be set in your environment');
}

export const redisClient = new Redis(redisUrl);

export const setSubmissionStatus = async (submissionId, status, result = null) => {
  const key = `submission:${submissionId}`;
  const data = {
    status,
    result,
    updatedAt: new Date().toISOString()
  };
  try {
    console.log(`[Redis] Setting status for ${submissionId} to: ${status}`);
    await redisClient.set(key, JSON.stringify(data), 'EX', 3600); // 1 hour TTL
    console.log(`[Redis] Successfully updated key: ${key}`);
  } catch (err) {
    console.error(`[Redis] Error setting status for ${submissionId}:`, err);
  }
};

export const setRunStatus = async (jobId, status, result = null) => {
  const key = `run:${jobId}`;
  const data = {
    status,
    result,
    updatedAt: new Date().toISOString()
  };
  try {
    console.log(`[Redis] Setting run status for ${jobId} to: ${status}`);
    await redisClient.set(key, JSON.stringify(data), 'EX', 1800); // 30 min TTL
  } catch (err) {
    console.error(`[Redis] Error setting run status for ${jobId}:`, err);
  }
};
