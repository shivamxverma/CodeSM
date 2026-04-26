import dotenv from "dotenv";
import mongoose from "mongoose";
import { Pool } from "pg";
import { createId } from "@paralleldrive/cuid2";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "codesm";
const DATABASE_URL = process.env.DATABASE_URL;
const USERS_COLLECTION = process.env.MONGO_USERS_COLLECTION || "users";

function assertEnv() {
  if (!MONGO_URI) throw new Error("MONGO_URI is required");
  if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
}

function toStr(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value?._id != null) return String(value._id);
  return String(value);
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function pickFirst(obj, paths) {
  for (const path of paths) {
    const value = getPath(obj, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const v = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return fallback;
}

function parseRole(value) {
  const raw = String(value || "USER").trim().toUpperCase();
  if (raw === "ADMIN") return "ADMIN";
  if (raw === "AUTHOR") return "AUTHOR";
  return "USER";
}

function sanitizeUsername(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractUser(doc) {
  const mongoId = toStr(doc._id) || createId();

  const emailRaw = pickFirst(doc, ["email", "googleEmail"]);
  const email = emailRaw ? String(emailRaw).trim().toLowerCase() : null;

  const usernameRaw =
    pickFirst(doc, ["username", "userName", "handle"]) ||
    (email ? email.split("@")[0] : null) ||
    `user_${mongoId.slice(-6)}`;
  const username = sanitizeUsername(usernameRaw) || `user_${mongoId.slice(-6)}`;

  const displayName = toStr(
    pickFirst(doc, ["displayName", "fullName", "name", "username", "userName"]),
  );
  const avatarUrl = toStr(
    pickFirst(doc, ["avatarUrl", "avatar", "profilePicture", "photoURL"]),
  );

  const role = parseRole(pickFirst(doc, ["role", "userRole"]));
  const is2FaAuthEnabled = toBool(
    pickFirst(doc, ["is2FaAuthEnabled", "is2FAEnabled", "twoFactorEnabled"]),
    false,
  );
  const isBanned = toBool(pickFirst(doc, ["isBanned", "banned", "isBlocked"]), false);
  const isEmailVerified = toBool(
    pickFirst(doc, ["isEmailVerified", "emailVerified", "isVerified"]),
    false,
  );
  const verificationToken = toStr(
    pickFirst(doc, ["verificationToken", "emailVerificationToken"]),
  );

  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : createdAt;

  const googleSub = toStr(pickFirst(doc, ["googleSub", "googleId", "oauth.googleSub"]));
  const googleEmail = toStr(pickFirst(doc, ["googleEmail"])) || email;
  const passwordHash = toStr(pickFirst(doc, ["passwordHash", "password", "hash"]));

  let provider = null;
  if (passwordHash) provider = "EMAIL_PASSWORD";
  else if (googleSub) provider = "GOOGLE_OAUTH";

  return {
    id: mongoId,
    email,
    username,
    displayName,
    avatarUrl,
    role,
    is2FaAuthEnabled,
    isBanned,
    isEmailVerified,
    verificationToken,
    createdAt,
    updatedAt,
    provider,
    googleSub,
    googleEmail,
    passwordHash,
  };
}

async function upsertUser(client, u) {
  await client.query(
    `insert into "user" (
      id, email, display_name, avatar_url, username, role,
      is2fa_auth_enabled, is_banned, is_email_verified, verification_token,
      created_at, updated_at
    )
    values (
      $1, $2, $3, $4, $5, $6::role,
      $7, $8, $9, $10, $11, $12
    )
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      username = excluded.username,
      role = excluded.role,
      is2fa_auth_enabled = excluded.is2fa_auth_enabled,
      is_banned = excluded.is_banned,
      is_email_verified = excluded.is_email_verified,
      verification_token = excluded.verification_token,
      updated_at = excluded.updated_at`,
    [
      u.id,
      u.email,
      u.displayName,
      u.avatarUrl,
      u.username,
      u.role,
      u.is2FaAuthEnabled,
      u.isBanned,
      u.isEmailVerified,
      u.verificationToken,
      u.createdAt,
      u.updatedAt,
    ],
  );

  if (!u.provider) return;

  await client.query(
    `insert into auth_method (
      id, user_id, provider, google_sub, google_email, email, password_hash,
      created_at, updated_at
    )
    values (
      $1, $2, $3::"AuthProvider", $4, $5, $6, $7, $8, $9
    )
    on conflict (user_id) do update set
      provider = excluded.provider,
      google_sub = excluded.google_sub,
      google_email = excluded.google_email,
      email = excluded.email,
      password_hash = excluded.password_hash,
      updated_at = excluded.updated_at`,
    [
      createId(),
      u.id,
      u.provider,
      u.provider === "GOOGLE_OAUTH" ? u.googleSub : null,
      u.provider === "GOOGLE_OAUTH" ? u.googleEmail : null,
      u.provider === "EMAIL_PASSWORD" ? u.email : null,
      u.provider === "EMAIL_PASSWORD" ? u.passwordHash : null,
      u.createdAt,
      u.updatedAt,
    ],
  );
}

async function main() {
  assertEnv();

  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  const mongoDb = mongoose.connection.db;
  const mongoUsers = await mongoDb.collection(USERS_COLLECTION).find({}).toArray();
  console.log(`Mongo users found: ${mongoUsers.length}`);

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    let migrated = 0;
    let skipped = 0;

    for (const doc of mongoUsers) {
      const u = extractUser(doc);
      try {
        await client.query("begin");
        await upsertUser(client, u);
        await client.query("commit");
        migrated += 1;
      } catch (err) {
        await client.query("rollback");
        skipped += 1;
        console.warn(`Skipped user ${u.id}: ${err.message}`);
      }
    }

    console.log(
      `User migration complete. Success: ${migrated}/${mongoUsers.length}, skipped: ${skipped}`,
    );
  } finally {
    client.release();
    await pool.end();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("User migration failed:", err);
  process.exitCode = 1;
});
