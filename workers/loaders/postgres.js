import { schema } from '../db/index.ts';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import logger from './logger.js';
import env from '../config/index.js';

function createDrizzle(pool) {
    return drizzle(pool, { schema });
}

export let db;
let pool;

export async function getDrizzleClient(){
    if (db) return db;

    if (!env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required for worker PostgreSQL connection');
    }

    pool = new Pool({
        connectionString: env.DATABASE_URL,
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
