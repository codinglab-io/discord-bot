import type { BotModule } from '../types/bot';

export const getIntentsFromModules = (modules: Record<string, BotModule>) => {
  const intents = Object.values(modules).flatMap((module) => module.intents ?? []);
  return [...new Set(intents)] as const;
};
