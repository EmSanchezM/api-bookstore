import { object, safeParse, string } from 'valibot';
import { InternalServerErrorException } from '@/modules/shared/exceptions';

export const ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST_URL: 'HOST_URL',
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_NAMESPACE: 'DATABASE_NAMESPACE',
  DATABASE_NAME: 'DATABASE_NAME',
  DATABASE_USERNAME: 'DATABASE_USERNAME',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
};

const environmentSchema = object({
  NODE_ENV: string(),
  PORT: string(),
  HOST_URL: string(),
  DATABASE_URL: string(),
  DATABASE_NAMESPACE: string(),
  DATABASE_NAME: string(),
  DATABASE_USERNAME: string(),
  DATABASE_PASSWORD: string(),
  JWT_SECRET: string(),
  JWT_EXPIRES_IN: string(),
});

export const getEnvironmentVariables = () => {
  const envVariables: Record<string, string> = {};

  for (const [key, value] of Object.entries(ENVIRONMENT_VARIABLES)) {
    const envValue = process.env[value];
    if (envValue) {
      envVariables[key] = envValue;
    }
  }

  const result = safeParse(environmentSchema, envVariables);

  if (!result.success) {
    throw new InternalServerErrorException(
      `Invalid environment variables: ${result.issues.map((issue) => issue.message).join(', ')}`,
    );
  }

  return result.output;
};
