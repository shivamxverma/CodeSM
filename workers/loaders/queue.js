import { Queue } from "bullmq";
import env from "../config/index.js";

const connection = {
    url: env.REDIS_URL
};

export const runQueue = new Queue("run-queue", { connection });
export const submitQueue = new Queue("submit-queue", { connection });