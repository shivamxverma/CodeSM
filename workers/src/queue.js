import Queue from "bull";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  try {
    return dotenv.parse(readFileSync(filePath));
  } catch {
    return {};
  }
}

const workersEnv = loadEnvFile(path.join(__dirname, "../.env"));
const backendEnv = loadEnvFile(path.join(__dirname, "../../backend/.env"));

// API enqueues jobs; worker must use the same Redis. Prefer backend/.env so a
// stale workers/.env REDIS_URL cannot split producer and consumer.
const redisUrl =
  process.env.REDIS_URL ||
  backendEnv.REDIS_URL ||
  workersEnv.REDIS_URL;

const redis =
  redisUrl ?? { host: "127.0.0.1", port: 6379 };

function maskRedisUrl(url) {
  if (!url || typeof url !== "string") return String(url);
  return url.replace(/:\/\/([^:/?#]+):([^@/?#]+)@/, "://$1:****@");
}

console.log(
  "[worker/queue] Redis:",
  typeof redis === "string" ? maskRedisUrl(redis) : redis
);

const myQueue = new Queue(
  "job-queue",
  typeof redis === "string" ? redis : { redis }
);

myQueue.on("error", (err) => {
  console.error("[worker/queue] Bull error:", err.message);
});

export default myQueue;
