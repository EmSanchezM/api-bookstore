import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { logger } from './logger';
import { database } from '../database';
import { generateRoutes } from './generate-routes';

export const createServer = async () => {
  dotenv.config();
  const server = express();

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cors());

  await database.getConnection();

  if (!database.isConnected()) {
    logger.error(' 🚫 Failed to connect to database');
    process.exit(1);
  }

  await generateRoutes(server);

  return server;
};
