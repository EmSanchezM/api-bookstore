import dotenv from 'dotenv';
dotenv.config();

import { getEnvironmentVariables } from './environment_variables';

const envVariables = getEnvironmentVariables();

export { envVariables };
