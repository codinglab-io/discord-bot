import { constantCase } from 'constant-case';

import type { CreatedModule, ModuleCreator } from './createModule';

const createEnvForModule = (constantName: string) =>
  Object.entries(process.env)
    .filter(([key]) => key.startsWith(constantName))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      const envKey = key.replace(`${constantName}_`, '');

      if (value === undefined) {
        return acc;
      }

      acc[envKey] = value;

      return acc;
    }, {});

export const createAllModules = async (
  modules: Record<string, ModuleCreator>,
): Promise<CreatedModule[]> => {
  const createdModules: CreatedModule[] = [];

  for (const { name, factory } of Object.values(modules)) {
    const moduleConstantName = constantCase(name);
    const env = createEnvForModule(moduleConstantName);
    const module = await factory({ env });

    createdModules.push(module);
  }

  return createdModules;
};
