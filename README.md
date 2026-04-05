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

## Adding problems to the local database (mongosh)

The API stores problems in MongoDB database **`codesm`** (see [backend/src/constants.js](backend/src/constants.js)). Mongoose maps the `Problem` model to the **`problems`** collection.

Recommended flow: **set up `mongosh` and point it at `codesm`**, then **run the bundled seed file** [backend/src/scripts/add-problems.js](backend/src/scripts/add-problems.js). That file is a **mongosh** script (it calls `db.problems.insertMany([...])`), not a Node program.

### Step 1 — Set up `mongosh` and the database

1. **Install the MongoDB Shell** on your machine:

   | OS | How to install |
   |----|----------------|
   | **macOS** | [Homebrew](https://brew.sh/): `brew install mongosh` — or install “MongoDB Shell” from the [MongoDB Download Center](https://www.mongodb.com/try/download/shell). |
   | **Windows** | Install the **MongoDB Shell** MSI from the [MongoDB Download Center](https://www.mongodb.com/try/download/shell), or use **winget** if a `MongoDB.Shell` (or similarly named) package is available in your catalog. |
   | **Linux** | Follow [Install mongosh](https://www.mongodb.com/docs/mongodb-shell/install/) for your distro (`.deb` / `.rpm`, tarball, or package manager). Example (Debian/Ubuntu): MongoDB’s official repo, then `sudo apt-get install -y mongosh`. |

2. **Check the shell**:

   ```bash
   mongosh --version
   ```

3. **Start MongoDB** (local `mongod`, Docker, or Atlas) so a server is reachable.

4. **Know your connection string** for database **`codesm`** (same DB the backend uses: `MONGO_URI` in `.env` plus the `codesm` suffix — see [backend/README.md](backend/README.md)). Examples:
   - Local: `mongodb://127.0.0.1:27017/codesm`
   - Atlas: `mongodb+srv://<user>:<password>@<cluster>/codesm?retryWrites=true&w=majority` (adjust query params as in your cluster)

5. **Optional sanity check** — open an interactive session and confirm the DB:

   ```bash
   mongosh "mongodb://127.0.0.1:27017/codesm"
   ```

   Then in the shell: `show collections` (you should see `users`, `problems`, etc. after the app or seeds have run).

### Step 2 — Run [backend/src/scripts/add-problems.js](backend/src/scripts/add-problems.js)

From the **repository root** (adjust the URI if you use Atlas or a non-default host/port):

```bash
mongosh "mongodb://127.0.0.1:27017/codesm" backend/src/scripts/add-problems.js
```

Or from **`backend/`**:

```bash
cd backend
mongosh "mongodb://127.0.0.1:27017/codesm" src/scripts/add-problems.js
```

The script loads many problem documents at once. It contains fixed **`_id`** and **`author`** values: ensure a **`users`** document exists with that `author` ObjectId (for example seed an admin with [backend/src/scripts/seed-admin.js](backend/src/scripts/seed-admin.js), then either align the script’s `author` field with your user’s `_id` or adjust the script before running). If you run the script twice, MongoDB may report duplicate key errors on `_id` or `title` — that is expected unless you remove existing rows or change identifiers in the file.

### Optional — Add or edit problems by hand in `mongosh`

Field requirements match [backend/src/models/problem.model.js](backend/src/models/problem.model.js). Resolve an author with `db.users.findOne({}, { _id: 1, username: 1 })`, then use `db.problems.insertOne({ ... })` with the same shape as in the seed script.

## Environment (summary)

Do not commit real secrets. Use placeholders in docs and local `.env` files only.

- **Backend**: `MONGO_URI`, `PORT`, `CLIENT_URL`, JWT secrets, `REDIS_URL`, AWS and optional Cloudinary / Google / email keys — details in [backend/README.md](backend/README.md).
- **Frontend**: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, optional PostHog — details in [Frontend/README.md](Frontend/README.md).
- **Workers**: `REDIS_URL`, AWS for S3 if used — details in [workers/README.md](workers/README.md).

## Usage

- **Creators**: Author problems, upload tests, manage content.
- **Users**: Sign up, solve problems, view results after execution.
- **Profiles**: Update profile and track activity where enabled.
