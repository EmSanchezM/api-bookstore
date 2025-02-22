import dotenv from 'dotenv';
dotenv.config();

import { getEnvironmentVariables } from './environment_variables';
import { logger } from './logger';
import { createServer } from './server';

const envVariables = getEnvironmentVariables();

export { envVariables, logger, createServer };
