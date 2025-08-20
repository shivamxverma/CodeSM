import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "http://localhost:6379";

const redis = new Redis(REDIS_URL);

export default redis;