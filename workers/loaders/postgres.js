import { schema } from 'db-schema';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import logger from './logger';

function createDrizzle(pool) {
    return drizzle(pool, { schema });
}

export let db;
let pool;

export async function getDrizzleClient(){
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