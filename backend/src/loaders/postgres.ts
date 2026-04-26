import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import logger from './logger';
import { schema } from '../../../db-schema/src/index';

function createDrizzle(pool: Pool) {
    return drizzle(pool, { schema });
}

type DrizzleDb = ReturnType<typeof createDrizzle>;

export let db: DrizzleDb;
let pool: Pool | undefined;

export async function getDrizzleClient(): Promise<DrizzleDb> {
    if (db) return db;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        allowExitOnIdle: false,
    });

    pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    db = createDrizzle(pool);
    logger.info('Database connection established successfully');
    return db;
}

export async function closeDatabaseConnection() {
    if (pool) {
        await pool.end();
        logger.error('Database connection closed');
    }
}