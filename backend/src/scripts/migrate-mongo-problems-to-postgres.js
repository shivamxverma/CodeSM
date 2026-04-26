import dotenv from "dotenv";
import mongoose from "mongoose";
import { Pool } from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "codesm";
const DATABASE_URL = process.env.DATABASE_URL;
const FORCED_AUTHOR_ID = process.env.PG_AUTHOR_ID;
const SKIP_S3_UPLOAD = process.env.SKIP_S3_UPLOAD === "true";

function assertEnv() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
}

function mapDifficulty(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "EASY";
  if (n <= 1200) return "EASY";
  if (n <= 1600) return "MEDIUM";
  if (n <= 2100) return "HARD";
  return "EXPERT";
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const exploded = [];
  for (const raw of tags) {
    if (raw == null) continue;
    const parts = String(raw).split(",");
    for (const part of parts) {
      const cleaned = part
        .replace(/^"+|"+$/g, "")
        .replace(/^'+|'+$/g, "")
        .trim()
        .toLowerCase();
      if (cleaned) exploded.push(cleaned);
    }
  }
  return [...new Set(exploded)];
}

function makeS3Client() {
  const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } =
    process.env;

  const canUpload =
    !SKIP_S3_UPLOAD &&
    Boolean(AWS_REGION) &&
    Boolean(AWS_ACCESS_KEY_ID) &&
    Boolean(AWS_SECRET_ACCESS_KEY) &&
    Boolean(AWS_BUCKET_NAME);

  if (!canUpload) {
    return { canUpload: false, s3: null, bucket: null };
  }

  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  return { canUpload: true, s3, bucket: AWS_BUCKET_NAME };
}

async function uploadTextToS3(s3, bucket, key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function resolveAuthorId(client) {
  if (FORCED_AUTHOR_ID) {
    const found = await client.query('select id from "user" where id = $1 limit 1', [
      FORCED_AUTHOR_ID,
    ]);
    if (found.rowCount === 0) {
      throw new Error(`PG_AUTHOR_ID not found in "user": ${FORCED_AUTHOR_ID}`);
    }
    return FORCED_AUTHOR_ID;
  }

  const preferred = await client.query(
    `select id
     from "user"
     where role in ('AUTHOR', 'ADMIN')
     order by created_at asc
     limit 1`,
  );
  if (preferred.rowCount && preferred.rows[0]?.id) {
    return preferred.rows[0].id;
  }

  const fallback = await client.query(
    'select id from "user" order by created_at asc limit 1',
  );
  if (fallback.rowCount && fallback.rows[0]?.id) {
    return fallback.rows[0].id;
  }

  throw new Error(
    'No users found in Postgres. Create at least one user, or set PG_AUTHOR_ID explicitly.',
  );
}

async function upsertProblemData(client, doc, authorId, s3Ctx) {
  const problemId = String(doc._id);
  const baseSlug = slugify(doc.title);
  const slug = doc.slug ? String(doc.slug) : `${baseSlug}-${problemId.slice(-6)}`;
  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : new Date();
  const difficulty = mapDifficulty(doc.difficulty);
  const finalStatus = s3Ctx.canUpload ? "DONE" : "DRAFT";

  const contentKey = `problems/${problemId}/content.md`;
  const solutionKey = `problems/${problemId}/solution.md`;

  await client.query(
    `insert into problem (
      id, title, description, slug, difficulty, author_id,
      input_format, output_format, constraints, status, time_limit, memory_limit,
      created_at, updated_at
    )
    values (
      $1, $2, $3, $4, $5::"Difficulty", $6,
      $7, $8, $9, $10::"ProblemStatus", $11, $12,
      $13, $14
    )
    on conflict (id) do update set
      title = excluded.title,
      description = excluded.description,
      slug = excluded.slug,
      difficulty = excluded.difficulty,
      author_id = excluded.author_id,
      input_format = excluded.input_format,
      output_format = excluded.output_format,
      constraints = excluded.constraints,
      status = excluded.status,
      time_limit = excluded.time_limit,
      memory_limit = excluded.memory_limit,
      updated_at = excluded.updated_at`,
    [
      problemId,
      doc.title || "Untitled Problem",
      doc.description || "",
      slug || `problem-${problemId.slice(-6)}`,
      difficulty,
      authorId,
      doc.inputFormat || "",
      doc.outputFormat || "",
      doc.constraints || "",
      finalStatus,
      Number(doc.timeLimit || 1),
      Number(doc.memoryLimit || 256),
      createdAt,
      updatedAt,
    ],
  );

  await client.query("delete from problem_tag where problem_id = $1", [problemId]);
  await client.query("delete from hint where problem_id = $1", [problemId]);
  await client.query("delete from testcase where problem_id = $1", [problemId]);

  const normalizedTags = normalizeTags(doc.tags);
  for (const tagName of normalizedTags) {
    const tagIdCandidate = createId();
    const tagRes = await client.query(
      `insert into tag (id, name)
       values ($1, $2)
       on conflict (name) do update set name = excluded.name
       returning id`,
      [tagIdCandidate, tagName],
    );
    const tagId = tagRes.rows[0].id;
    await client.query(
      `insert into problem_tag (problem_id, tag_id)
       values ($1, $2)
       on conflict do nothing`,
      [problemId, tagId],
    );
  }

  const hints = Array.isArray(doc.hints) ? doc.hints : [];
  for (let i = 0; i < hints.length; i += 1) {
    const h = hints[i] || {};
    await client.query(
      `insert into hint (id, problem_id, "order", title, content, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        createId(),
        problemId,
        i + 1,
        String(h.title || `Hint ${i + 1}`),
        String(h.content || ""),
        createdAt,
        updatedAt,
      ],
    );
  }

  if (s3Ctx.canUpload) {
    await uploadTextToS3(
      s3Ctx.s3,
      s3Ctx.bucket,
      contentKey,
      String(doc.editorial || ""),
      "text/markdown",
    );
    await uploadTextToS3(
      s3Ctx.s3,
      s3Ctx.bucket,
      solutionKey,
      String(doc.solution || ""),
      "text/plain",
    );

    const sampleTestcases = Array.isArray(doc.sampleTestcases) ? doc.sampleTestcases : [];
    for (let i = 0; i < sampleTestcases.length; i += 1) {
      const tc = sampleTestcases[i] || {};
      const tcKey = `problems/${problemId}/sampleTestcase_${i}.json`;
      await uploadTextToS3(
        s3Ctx.s3,
        s3Ctx.bucket,
        tcKey,
        JSON.stringify(
          {
            input: String(tc.input || ""),
            output: String(tc.output || ""),
          },
          null,
          2,
        ),
        "application/json",
      );

      await client.query(
        `insert into testcase (id, problem_id, s3_key, is_sample, is_hidden, "order", batch, created_at)
         values ($1, $2, $3, true, false, $4, 0, $5)`,
        [createId(), problemId, tcKey, i, createdAt],
      );
    }
  }

  await client.query(
    `insert into editorial (id, problem_id, content_s3_key, solution_s3_key, editorial_link, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (problem_id) do update set
       content_s3_key = excluded.content_s3_key,
       solution_s3_key = excluded.solution_s3_key,
       editorial_link = excluded.editorial_link,
       updated_at = excluded.updated_at`,
    [
      createId(),
      problemId,
      contentKey,
      solutionKey,
      doc.editorialLink ? String(doc.editorialLink) : null,
      createdAt,
      updatedAt,
    ],
  );
}

async function main() {
  assertEnv();

  const s3Ctx = makeS3Client();
  console.log(
    s3Ctx.canUpload
      ? "S3 upload mode: enabled (problems will be migrated as DONE)"
      : "S3 upload mode: disabled (problems will be migrated as DRAFT)",
  );

  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  const mongoDb = mongoose.connection.db;
  const mongoProblems = await mongoDb.collection("problems").find({}).toArray();
  console.log(`Mongo problems found: ${mongoProblems.length}`);

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    const authorId = await resolveAuthorId(client);
    console.log(`Using Postgres author_id: ${authorId}`);

    let migrated = 0;
    for (const doc of mongoProblems) {
      try {
        await client.query("begin");
        await upsertProblemData(client, doc, authorId, s3Ctx);
        await client.query("commit");
        migrated += 1;
        console.log(`Migrated: ${doc.title} (${String(doc._id)})`);
      } catch (err) {
        await client.query("rollback");
        console.error(`Failed: ${doc?.title || doc?._id}`, err.message);
      }
    }

    console.log(`Migration complete. Success: ${migrated}/${mongoProblems.length}`);
  } finally {
    client.release();
    await pool.end();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
