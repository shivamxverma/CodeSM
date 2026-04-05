# Local problems data setup (contributors)

This guide walks through loading **problem documents** into MongoDB and, when you need real judging, uploading **hidden test cases** to S3. Use it when you clone the repo and want the same problem catalog as the main project.

## What gets seeded where

| Data | Storage | How |
|------|---------|-----|
| Problem metadata (title, limits, samples, etc.) | MongoDB database **`codesm`**, collection **`problems`** | `mongosh` + [backend/src/scripts/add-problems.js](../backend/src/scripts/add-problems.js) |
| Hidden test cases for the judge | S3 object `problems/<problemId>/testcases.json` | Node script [backend/src/scripts/uploadAllTestcases.js](../backend/src/scripts/uploadAllTestcases.js) (requires AWS credentials) |

The backend appends the database name `codesm` to `MONGO_URI` (see [backend/src/constants.js](../backend/src/constants.js) and [backend/README.md](../backend/README.md)). Your `mongosh` connection string must target that same database (e.g. `.../codesm`).

---

## Suggested order

1. Run **MongoDB** (local, Docker, or Atlas) and **Redis** if you will run the API or workers.
2. Configure **`backend/.env`** (at least `MONGO_URI` without the `/codesm` suffix, matching how the app expects it).
3. Install **mongosh** and seed **problems** in MongoDB.
4. Fix the **`author`** field so it points at a real user (or insert a stub user with the seed’s ObjectId).
5. If you need submissions graded against hidden tests: configure **AWS S3** and run **`uploadAllTestcases.js`**.
6. Start **backend**, **Frontend**, and **workers** as described in the root [README.md](../README.md).

---

## 1. Install MongoDB Shell (`mongosh`)

1. Install **mongosh** for your OS:
   - **macOS**: [Homebrew](https://brew.sh/) — `brew install mongosh`, or the [MongoDB Shell download](https://www.mongodb.com/try/download/shell).
   - **Windows**: MSI from the [MongoDB Shell download](https://www.mongodb.com/try/download/shell), or **winget** if available.
   - **Linux**: [Install mongosh](https://www.mongodb.com/docs/mongodb-shell/install/) for your distro.

2. Verify:

   ```bash
   mongosh --version
   ```

3. Ensure a MongoDB server is reachable and you know the connection string for database **`codesm`**.

   Examples:

   - Local: `mongodb://127.0.0.1:27017/codesm`
   - Atlas: `mongodb+srv://<user>:<password>@<cluster>/codesm?retryWrites=true&w=majority` (adjust query params to match your cluster)

4. Optional sanity check:

   ```bash
   mongosh "mongodb://127.0.0.1:27017/codesm"
   ```

   In the shell: `show collections` — after seeding you should see `problems` (and `users` if you have signed up or seeded users).

---

## 2. Seed problems with `add-problems.js`

The file [backend/src/scripts/add-problems.js](../backend/src/scripts/add-problems.js) is a **mongosh** script (it uses `db.problems.insertMany(...)`). It is **not** run with Node.

From the **repository root** (change the URI if you use Atlas or a non-default host/port):

```bash
mongosh "mongodb://127.0.0.1:27017/codesm" backend/src/scripts/add-problems.js
```

From **`backend/`**:

```bash
cd backend
mongosh "mongodb://127.0.0.1:27017/codesm" src/scripts/add-problems.js
```

### Re-running the script

The script starts with `db.problems.deleteMany({})`, which **removes every document** in `problems`, then inserts the bundled set. Re-runs avoid duplicate `_id` / `title` errors, but you lose any problems that were not in this file (for example authored locally in the app). Do not run it against a database you share with others unless that full reset is intentional.

---

## 3. Fix the `author` field

The seed sets `author` to ObjectId `68ac7d7e56208746693283a0`. A normal signup or [backend/src/scripts/seed-admin.js](../backend/src/scripts/seed-admin.js) admin user will **not** automatically have that `_id`, so the UI or populated queries may not resolve the author unless you fix it.

Pick one approach:

### Option A — Stub user with the exact `_id`

In `mongosh` on database `codesm`, insert a user document whose `_id` matches the seed. Fields must satisfy [backend/src/models/user.model.js](../backend/src/models/user.model.js) (at minimum `username`, `fullName`, `email`; `password` can be omitted if you only use OAuth locally).

Example (adjust values; hash a password if you need local login):

```javascript
db.users.insertOne({
  _id: ObjectId("68ac7d7e56208746693283a0"),
  username: "seedauthor",
  fullName: "Seed Author",
  email: "seedauthor@local.dev",
  role: "author"
})
```

### Option B — Point all seeded problems at your user

After seeding, set `author` to your account’s `_id`:

```javascript
const me = db.users.findOne({ email: "you@example.com" }, { _id: 1 })
db.problems.updateMany({}, { $set: { author: me._id } })
```

---

## 4. (Optional) Hidden test cases on S3

The API and workers load full test data from S3 via [backend/services/aws.service.js](../backend/services/aws.service.js) using:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BUCKET_NAME`

Set these in **`backend/.env`** and **`workers/.env`** (and any other service that reads the same bucket).

Upload bundled test JSON for each problem:

```bash
cd backend
npm install   # if not already done
node src/scripts/uploadAllTestcases.js
```

### Bucket name

The uploader script currently hardcodes `BUCKET = "codesm-testcases-bucket"`. Your bucket must match that name **or** you should change the script to use `process.env.AWS_BUCKET_NAME` so it stays in sync with the rest of the app.

---

## 5. Add or edit problems manually

Field shapes must match [backend/src/models/problem.model.js](../backend/src/models/problem.model.js). Find an author:

```javascript
db.users.findOne({}, { _id: 1, username: 1 })
```

Then `db.problems.insertOne({ ... })` using the same structure as documents in `add-problems.js`.

---

## Quick reference

| Goal | Command / action |
|------|------------------|
| Load problem catalog | `mongosh "<uri>/codesm" backend/src/scripts/add-problems.js` |
| Fix author | Stub user with fixed `_id` or `updateMany` as above |
| Upload hidden tests | `cd backend && node src/scripts/uploadAllTestcases.js` (AWS + bucket aligned) |

For general app setup (ports, Redis, workers), see the root [README.md](../README.md) and [backend/README.md](../backend/README.md).
