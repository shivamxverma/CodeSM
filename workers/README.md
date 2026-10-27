# CodeSM — Workers

Background workers for CodeSM using [Bull](https://github.com/OptimalBits/bull) and Redis. Jobs run user code (C++ flow in `runCode.js`) and return output to the queue consumer.

## Prerequisites

- Node.js 18+
- Redis reachable at `REDIS_URL` (default `redis://localhost:6379`)
- Same queue name and Redis as the backend Bull configuration (`job-queue`)

## Install

```bash
cd workers
npm install
```

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string used to update `submission`/`execution_result` |
| `REDIS_URL` | Redis connection string (default `redis://localhost:6379`) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | Used by `services/aws.service.js` when pulling problem assets from S3 |

## Run

```bash
npm start
```

This runs `node src/worker.js`, which registers a Bull processor on the `job-queue` queue.

## Docker

- `docker/sandbox-runner/Dockerfile` is the sandbox image user code runs in. The worker builds it automatically if it's missing.
- `Dockerfile.prod` builds the worker itself (used by `docker-compose.prod.yml` at the repo root).

## Backend coordination

The API in `../backend` enqueues work onto the same Bull queue. Start Redis, then the backend, then this worker process, for end-to-end code execution.
