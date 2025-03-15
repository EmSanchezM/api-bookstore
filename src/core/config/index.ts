import dotenv from 'dotenv';
dotenv.config();

import { getEnvironmentVariables } from './environment_variables';
import { logger } from './logger';
import { createServer } from './server';
import { generateRoutes } from './generate-routes';

const envVariables = getEnvironmentVariables();

export { logger, envVariables, createServer, getEnvironmentVariables, generateRoutes };
