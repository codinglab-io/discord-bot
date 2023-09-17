import type { CreatedModule } from './createModule';

export const getIntentsFromModules = (modules: CreatedModule[]) => {
  const intents = modules.flatMap((module) => module.intents ?? []);
  return [...new Set(intents)] as const;
};
