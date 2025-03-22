import Surreal, { ConnectionStatus, ResponseError } from 'surrealdb';

import { getEnvironmentVariables, logger } from '../config';
import { defineTables } from './define-tables';
import { DatabaseErrorException } from '@/modules/shared/exceptions';

interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

const envVariables = getEnvironmentVariables();

const DEFAULT_CONFIG: DbConfig = {
  url: envVariables.DATABASE_URL,
  namespace: envVariables.DATABASE_NAMESPACE,
  database: envVariables.DATABASE_NAME,
  username: envVariables.DATABASE_USERNAME,
  password: envVariables.DATABASE_PASSWORD,
};

export async function getDatabaseConnection(config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> {
  const db = new Surreal();

  try {
    await db.connect(config.url);
    await db.use({ namespace: config.namespace, database: config.database });

    await db.signin({
      username: config.username,
      password: config.password,
    });

    if (db.status !== ConnectionStatus.Connected) throw new DatabaseErrorException('Failed to connect to SurrealDB');

    await defineTables(db);

    return db;
  } catch (err: unknown) {
    if (err instanceof Error || err instanceof DatabaseErrorException || err instanceof ResponseError)
      logger.error('Failed to connect to SurrealDB:', err.message);

    await db.close();
    throw err;
  }
}
