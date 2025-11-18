import Queue from 'bull';

export const myQueue = new Queue("job-queue", {
  redis: { host: "127.0.0.1", port: 6379 },
});