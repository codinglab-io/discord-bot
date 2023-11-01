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

export const createAllModules = async (modules: ModuleCreator[]): Promise<CreatedModule[]> => {
  const uniqueModuleNames = new Set(modules.map((module) => module.name));
  if (uniqueModuleNames.size !== modules.length) {
    throw new Error('Found duplicate module names');
  }

  const createdModules: CreatedModule[] = [];

  for (const { name, factory } of modules) {
    const moduleConstantName = constantCase(name);
    const env = createEnvForModule(moduleConstantName);
    const module = await factory({ env });

    createdModules.push(module);
  }

  return createdModules;
};
