# CodeSM — Backend

Express API for CodeSM: users, problems, submissions, contests, interviews, discussions, and jobs. Uses MongoDB (Mongoose), Redis, Bull for background jobs, AWS S3 for assets, and optional Google OAuth, Cloudinary, and email.

## Prerequisites

- Node.js 18+ (project uses ES modules)
- MongoDB (connection string without trailing database name; app appends `codesm`)
- Redis (for Bull queue and rate limiting / caching where configured)

## Install

```bash
cd backend
npm install
```

## Environment

Create a `.env` file in `backend/` (the app also loads `./env` from `src/index.js` in addition to `.env` usage in some modules—prefer `.env` for local development).

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB URI **without** the database name suffix (e.g. `mongodb+srv://user:pass@cluster/`) |
| `PORT` | HTTP port (default `8000`) |
| `CLIENT_URL` | Frontend origin for CORS and OAuth redirects (e.g. `http://localhost:5173`) |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing |
| `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` | JWT lifetimes |
| `REDIS_URL` | Redis URL for Bull and Redis utilities |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | S3 |
| `CLOUDINARY_*` | Image uploads |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` or `LOCAL_CALLBACK_URL` | Google OAuth |
| `GEMINI_API_KEY`, `MURF_API_KEY` | AI / interview features (when used) |
| `EMAIL_*` | Nodemailer (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`) |
| `WORKER_URL` | Base URL of the worker HTTP service if you expose one (defaults to `http://localhost:3000`) |

## Run

```bash
npm run dev    # nodemon
npm start      # production-style: node src/index.js
```

API routes are mounted under `/api/v1/` (e.g. `/api/v1/users`, `/api/v1/problem`, `/api/v1/submission`, `/api/v1/contest`, `/api/v1/interview`, `/api/v1/discussion`, `/api/v1/job`).

## Related packages

- **Frontend**: Vite React app in `../Frontend` (proxies `/api` to this server in dev).
- **Workers**: Bull consumers for code execution in `../workers`—must use the same Redis and queue name as `src/config/queue.config.js`.
