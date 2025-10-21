import * as schema from '../drizzle/schema';
import * as relations from '../drizzle/relations';
import logger from './logger';
import env from '../config/index';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

export let db: NodePgDatabase<typeof schema>;
let pool : Pool;

export async function getDrizzleClient() {
  if (!db) {
    try {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
      });

      await pool.connect();

      db = drizzle({ client: pool, schema: { ...schema , ...relations } as unknown as typeof schema }) as unknown as NodePgDatabase<typeof schema>;

      logger.info('🛡️  Database connection established successfully  🛡️');
    } catch (error) {
      console.error('‼️    Failed to initialize database connection:', error);
      throw error;
    }
  }
  return db;
}

export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}


