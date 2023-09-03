import type { Client, ClientEvents } from 'discord.js';

import type { BotModule } from '../types/bot';

export const routeHandlers = (client: Client<true>, modulesToLoad: Record<string, BotModule>) => {
  const eventNames = Object.values(modulesToLoad).flatMap(
    (module) => Object.keys(module.eventHandlers ?? {}) as (keyof ClientEvents)[],
  );
  const uniqueEventNames = [...new Set(eventNames)];

  uniqueEventNames.forEach((eventName) => {
    const eventHandlersToCall = Object.values(modulesToLoad)
      .map((module) => module.eventHandlers?.[eventName])
      .filter((e): e is (...args: ClientEvents[keyof ClientEvents]) => Promise<void> => Boolean(e));

    client.on(eventName, async (...args) => {
      const handlersPromises = eventHandlersToCall.map(async (handler) => handler(...args));
      await Promise.allSettled(handlersPromises);
    });
  });
};
