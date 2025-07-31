import {redisClient} from '../utils/redis.js';

const POINTS = 10;   
const WINDOW = 60;  
const KEY_PREFIX = 'rl_submissions';

export async function rateLimitMiddleware(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `${KEY_PREFIX}:${userId}`;
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, WINDOW);
    }

    if (current > POINTS) {
      const ttl = await redisClient.ttl(key);
      const retrySecs = ttl > 0 ? ttl : WINDOW;
      return res
        .set('Retry-After', String(retrySecs))
        .status(429)
        .json({ error: `Too many submissions. Try again in ${retrySecs}s.` });
    }

    next();

  } catch (err) {
    console.error('Rate limiter error:', err);
    next();
  }
}
