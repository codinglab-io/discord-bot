import { z } from 'zod';

import type { BotModule } from '../types/bot';

export let allEnvSchemas = z.object({});
export const getEnv = () => process.env as z.infer<typeof allEnvSchemas>;

export const loadEnvirontmentVariables = (modules: Record<string, BotModule>): void => {
  const modulesEnv = Object.values(modules)
    .map((module) => 'env' in module && module.env)
    .filter(<T>(env: T): env is Exclude<T, false> => Boolean(env))
    .reduce((acc, currentEnv) => {
      Object.keys(currentEnv).forEach((key) => {
        if (Object.keys(acc).includes(key)) {
          throw new Error(`Duplicate environment variable found: ${key}`);
        }
      });
      return { ...acc, ...currentEnv };
    });

  Object.entries(modulesEnv).forEach(([key, schema]) => {
    allEnvSchemas = allEnvSchemas.extend({ [key]: schema });
    schema.parse(process.env[key]);
  });
};
