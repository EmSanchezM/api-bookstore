import 'reflect-metadata';
import { json, urlencoded } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InversifyExpressServer } from 'inversify-express-utils';

import { logger } from './logger';
import { database } from '../database';

import '../ioc/registry';
import { loadContainer } from '../ioc/container';

export const createServer = async () => {
  try {
    dotenv.config();
  
    await database.getConnection();

    if (!database.isConnected()) {
      logger.error(' 🚫 Failed to connect to database');
      process.exit(1);
    }

    const container = await loadContainer();
    const server = new InversifyExpressServer(container);

    server.setConfig((app) => {
      app.use(json());
      app.use(urlencoded({ extended: true }));
      app.use(cors());
    });

    return server.build();
  } catch (error) {
    logger.error('Failed to create server:', error);
    throw error;
  }
};
