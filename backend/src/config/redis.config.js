import Redis from "ioredis";
import env from './index.js';
const redis_url=env.REDIS_URL

const redis = new Redis(redis_url);

export default redis;
