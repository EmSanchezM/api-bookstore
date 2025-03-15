import * as valibot from 'valibot';

export const ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST_URL: 'HOST_URL',
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_NAMESPACE: 'DATABASE_NAMESPACE',
  DATABASE_NAME: 'DATABASE_NAME',
  DATABASE_USERNAME: 'DATABASE_USERNAME',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
};

const environmentSchema = valibot.object({
  NODE_ENV: valibot.string(),
  PORT: valibot.string(),
  HOST_URL: valibot.string(),
  DATABASE_URL: valibot.string(),
  DATABASE_NAMESPACE: valibot.string(),
  DATABASE_NAME: valibot.string(),
  DATABASE_USERNAME: valibot.string(),
  DATABASE_PASSWORD: valibot.string(),
});

export const getEnvironmentVariables = () => {
  const envVariables: Record<string, string> = {};

  for (const [key, value] of Object.entries(ENVIRONMENT_VARIABLES)) {
    const envValue = process.env[value];
    if (envValue) {
      envVariables[key] = envValue;
    }
  }

  const result = valibot.safeParse(environmentSchema, envVariables);

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.issues.map((issue) => issue.message).join(', ')}`);
  }

  return result.output;
};
