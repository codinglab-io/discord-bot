import type { Client } from 'discord.js';

import type { BotModule, CustomClientEvents, EventHandler } from '../types/bot';

export const routeHandlers = (client: Client<true>, modulesToLoad: Record<string, BotModule>) => {
  const eventNames = Object.values(modulesToLoad).flatMap(
    (module) => Object.keys(module.eventHandlers ?? {}) as (keyof CustomClientEvents)[],
  );
  const uniqueEventNames = [...new Set(eventNames)];

  uniqueEventNames.forEach((eventName) => {
    const eventHandlersToCall = Object.values(modulesToLoad)
      .map((module) => module.eventHandlers?.[eventName])
      .filter((e): e is EventHandler => Boolean(e));

    client.on(eventName, async (...args) => {
      const handlersPromises = eventHandlersToCall.map(async (handler) => handler(...args));
      await Promise.allSettled(handlersPromises);
    });
  });
};
