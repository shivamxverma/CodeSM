
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add missing columns to problem table
    console.log('Adding missing columns to "problem" table...');
    await client.query(`
      ALTER TABLE "problem" 
      ADD COLUMN IF NOT EXISTS "slug" text,
      ADD COLUMN IF NOT EXISTS "input_format" text,
      ADD COLUMN IF NOT EXISTS "output_format" text,
      ADD COLUMN IF NOT EXISTS "constraints" text,
      ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'DRAFT',
      ADD COLUMN IF NOT EXISTS "time_limit" integer,
      ADD COLUMN IF NOT EXISTS "memory_limit" integer;
    `);

    // Update existing rows for problem table
    await client.query(`UPDATE "problem" SET "slug" = "id" WHERE "slug" IS NULL`);
    await client.query(`UPDATE "problem" SET "input_format" = '' WHERE "input_format" IS NULL`);
    await client.query(`UPDATE "problem" SET "output_format" = '' WHERE "output_format" IS NULL`);
    await client.query(`UPDATE "problem" SET "constraints" = '' WHERE "constraints" IS NULL`);
    await client.query(`UPDATE "problem" SET "time_limit" = 1000 WHERE "time_limit" IS NULL`);
    await client.query(`UPDATE "problem" SET "memory_limit" = 256 WHERE "memory_limit" IS NULL`);

    // Synchronize testcase table columns
    console.log('Synchronizing "testcase" table columns...');
    await client.query(`
      ALTER TABLE "testcase" 
      ADD COLUMN IF NOT EXISTS "s3_key" text,
      ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "order" smallint DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "batch" smallint DEFAULT 0;
    `);
    
    // Set s3_key to NOT NULL if needed (after providing a default if rows exist)
    // For now we'll just ensure the columns exist since problem creation is failing.

    // Synchronize submission table columns
    console.log('Synchronizing "submission" table columns...');
    await client.query(`
      ALTER TABLE "submission" 
      ADD COLUMN IF NOT EXISTS "total_testcases" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "passed_testcases" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "failed_testcases" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "time_taken" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "memory_taken" integer DEFAULT 0;
    `);

    // Rename testcases table if it exists
    console.log('Checking for "testcases" table rename...');
    const res = await client.query("SELECT to_regclass('public.testcases')");
    if (res.rows[0].to_regclass) {
      console.log('Renaming "testcases" to "testcase"');
      await client.query('ALTER TABLE "testcases" RENAME TO "testcase"');
    } else {
        console.log('"testcases" table not found or already renamed.');
    }

    console.log('Database synced successfully!');
  } catch (err) {
    console.error('Error syncing database:', err);
  } finally {
    await client.end();
  }
}

run();
