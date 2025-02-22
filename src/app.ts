import { ConnectionStatus } from 'surrealdb';
import { envVariables, createServer, logger } from './config';
import { getDatabaseConnection } from './database/connection';

async function main() {
  const server = createServer();

  server.listen(envVariables.PORT, async() => {
    const db = await getDatabaseConnection();
    const healCheck = await db.ping();
    const isConnected = db.status === ConnectionStatus.Connected && healCheck;

    if (!isConnected) {
      logger.error('Failed to connect to SurrealDB:', db.status);
      process.exit(1);
    }

    logger.info('🚀 Datatabase is up and running!');
    logger.info(`🚀 Server is running on port ${envVariables.PORT}`);
  });
};

main();
