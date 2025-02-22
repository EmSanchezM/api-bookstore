import { envVariables } from './config';
import { getDatabaseConnection } from './database/connection';

async function main() {
  console.log({ envVariables });

  // connect to database
  const db = await getDatabaseConnection();
  // test health check
  const healthcheck = await db.ping();
  if (db.status === 'connected' && healthcheck) {
    console.info('🟢 SurrealDB is connected and healthy');
  } else {
    console.error('🔴 SurrealDB is not connected or healthy');
  }
};

main();
