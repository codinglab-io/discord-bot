import { constantCase } from 'constant-case';

import type { CreatedModule, ModuleFactory } from './createModule';

export const createAllModules = async (
  modules: Record<string, ModuleFactory>,
): Promise<CreatedModule[]> => {
  const createdModules: CreatedModule[] = [];

  for (const [name, factory] of Object.entries(modules)) {
    const constantName = constantCase(name);

    const moduleEnv = Object.entries(process.env)
      .filter(([key]) => key.startsWith(constantName))
      .reduce<Record<string, string>>((acc, [key, value]) => {
        const envKey = key.replace(`${constantName}_`, '');

        if (value === undefined) {
          return acc;
        }

        acc[envKey] = value;

        return acc;
      }, {});

    const module = await factory({ env: moduleEnv });

    createdModules.push(module);
  }

  return createdModules;
};
