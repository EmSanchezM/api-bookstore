import Surreal from 'surrealdb';

import { envVariables } from '../config';

// Define the database configuration interface
interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

// Define the default database configuration
const DEFAULT_CONFIG: DbConfig = {
  url: envVariables.DATABASE_URL,
  namespace: envVariables.DATABASE_NAMESPACE,
  database: envVariables.DATABASE_NAME,
  username: envVariables.DATABASE_USERNAME,
  password: envVariables.DATABASE_PASSWORD,
};

// Define the function to get the database instance
export async function getDatabaseConnection(config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> {
  const db = new Surreal();

  try {
    await db.connect(config.url);
    await db.use({ namespace: config.namespace, database: config.database });

    if (db.status !== 'connected') throw new Error('Failed to connect to SurrealDB');

    return db;
  } catch (err) {
    console.error('Failed to connect to SurrealDB:', err instanceof Error ? err.message : String(err));
    await db.close();
    throw err;
  }
}
