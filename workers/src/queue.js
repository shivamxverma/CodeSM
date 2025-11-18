import Queue from 'bull';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = 'redis://localhost:6379';

const myQueue = new Queue("job-queue",REDIS_URL);

export default myQueue;