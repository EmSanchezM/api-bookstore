import { envVariables, createServer, logger } from './core/config';
import { database } from './core/database';

async function main() {
  try {
    const server = await createServer();

    server.listen(envVariables.PORT, () => {
      logger.info(`🌎 API Bookstore is running on ${envVariables.HOST_URL}:${envVariables.PORT}`);
    });

    const shutdown = async () => {
      logger.info('🚀 Shutting down API Bookstore...');
      await database.closeConnection();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
