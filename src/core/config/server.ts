import 'reflect-metadata';
import { json, urlencoded } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InversifyExpressServer } from 'inversify-express-utils';

import { logger } from './logger';
import { database } from '../database';

import '@/core/ioc/registry';
import { loadContainer } from '@/core/ioc/container';
import { TYPES } from '@/core/common/constants/types';
import { ErrorHandlerMiddleware } from '@/modules/shared/middlewares/error-handlers';

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

    server.setErrorConfig((app) => {
      const errorHandlerMiddleware = container.get<ErrorHandlerMiddleware>(TYPES.ErrorHandlerMiddleware);
      app.use(errorHandlerMiddleware.catchAll.bind(errorHandlerMiddleware));
    });
    
    return server.build();
  } catch (error) {
    logger.error('Failed to create server:', error);
    throw error;
  }
};
