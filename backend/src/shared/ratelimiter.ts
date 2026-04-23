import redis from '../loaders/redis';
import asyncHandler from '../utils/asyncHandler.js';
import type { NextFunction, Request, Response } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

const CAPACITY   = 10;          
const WINDOW     = 60;           
const REFILL_RATE = CAPACITY / WINDOW;
const KEY_PREFIX = 'rl_tb';

export const rateLimitMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    // Per-user bucket only applies after auth; public routes must not be blocked here.
    if (!userId) {
      return next();
    }

    const key = `${KEY_PREFIX}:${userId}`;       
    const now = Date.now() / 1000;             

    const bucket = await redis.hgetall(key);
    let tokens = parseFloat(bucket.tokens) || CAPACITY;
    let last   = parseFloat(bucket.last)   || now;

    const delta = now - last;
    tokens = Math.min(CAPACITY, tokens + delta * REFILL_RATE);
    last   = now;

    if (tokens < 1) {
      const retrySecs = Math.ceil((1 - tokens) / REFILL_RATE);
      return res
        .set('Retry-After', String(retrySecs))
        .status(429)
        .json({ error: `Too many submissions. Try again in ${retrySecs}s.` });
    }

    tokens -= 1;

    const pipeline = redis.multi();
    pipeline.hset(key, 'tokens', tokens, 'last', last);
    pipeline.expire(key, WINDOW);
    await pipeline.exec();

    next();

  } catch (err) {
    console.error('Token-bucket rate limiter error:', err);
    next();
  }
});
