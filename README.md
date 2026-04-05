# CodeSM

## Overview

CodeSM is a multi-role platform where creators publish coding problems and users solve them. It provides problem authoring, secure code execution, profiles, contests, discussions, and rate limiting for reliability.

## Repository layout

This monorepo is organized into runnable packages:

| Package | Role |
|---------|------|
| [backend/](backend/) | Express API, MongoDB, Redis/Bull, S3, OAuth |
| [Frontend/](Frontend/) | React + Vite SPA |
| [workers/](workers/) | Bull workers for code execution against Redis |

Install and run each package from its own directory (see each `README.md`).

## Features

- **Roles**: Creators store problems and test cases (e.g. S3); users browse and submit solutions.
- **Execution**: Submissions are processed via Docker-backed flows and Bull workers.
- **Profiles**: User details, images, and engagement (e.g. streaks).
- **Security**: Rate limiting to reduce abuse and DoS risk.

## Software design architecture

High-level layers, components, and sequence flows (submit, dry run, results) are documented in **[docs/architecture.md](docs/architecture.md)**.

## Tech stack

- **Backend**: Node.js (Express), MongoDB (Mongoose), Redis, Bull, AWS S3
- **Frontend**: React, Vite, Tailwind
- **Workers**: Node.js + Bull + Redis
- **Optional**: Docker for isolated runs, Cloudinary, Google OAuth, email (Nodemailer)

## Quick start

1. **Clone**

   ```bash
   git clone https://github.com/shivamxverma/codesm.git
   cd codesm
   ```

2. **Infrastructure**: Run MongoDB and Redis locally or use managed services.

3. **Backend** — from `backend/`:

   ```bash
   npm install
   ```

   Create `backend/.env` with at least `MONGO_URI`, JWT secrets, `REDIS_URL`, and any AWS/S3 or OAuth variables you need. See [backend/README.md](backend/README.md).

   ```bash
   npm run dev
   ```

   Default API: `http://localhost:8000`.

4. **Frontend** — from `Frontend/`:

   ```bash
   npm install
   ```

   Set `VITE_API_URL` and related variables (see [Frontend/README.md](Frontend/README.md)).

   ```bash
   npm run dev
   ```

   Default dev server: `http://localhost:5173` (proxies `/api` to port 8000).

5. **Workers** — from `workers/` (for queued code execution):

   ```bash
   npm install
   npm start
   ```

   See [workers/README.md](workers/README.md).

## Environment (summary)

Do not commit real secrets. Use placeholders in docs and local `.env` files only.

- **Backend**: `MONGO_URI`, `PORT`, `CLIENT_URL`, JWT secrets, `REDIS_URL`, AWS and optional Cloudinary / Google / email keys — details in [backend/README.md](backend/README.md).
- **Frontend**: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, optional PostHog — details in [Frontend/README.md](Frontend/README.md).
- **Workers**: `REDIS_URL`, AWS for S3 if used — details in [workers/README.md](workers/README.md).

## Usage

- **Creators**: Author problems, upload tests, manage content.
- **Users**: Sign up, solve problems, view results after execution.
- **Profiles**: Update profile and track activity where enabled.
