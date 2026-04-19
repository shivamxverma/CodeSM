import * as schema from '../db/schema';
import * as relations from '../db/relations';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import logger from './logger';

const drizzleSchema = {
    ...schema,
    ...relations,
};

function createDrizzle(pool: Pool) {
    return drizzle(pool, { schema: drizzleSchema });
}

type DrizzleDb = ReturnType<typeof createDrizzle>;

export let db: DrizzleDb;
let pool: Pool | undefined;

export async function getDrizzleClient(): Promise<DrizzleDb> {
    if (db) return db;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
        allowExitOnIdle: false, // Keep pool alive even if all clients are idle
    });

    pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    db = createDrizzle(pool);
    logger.info('🛡️  Database connection established successfully  🛡️');
    return db;
}


export async function closeDatabaseConnection() {
    if (pool) {
      await pool.end();
      logger.error('Database connection closed');
    }
  }
