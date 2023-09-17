import type { Client, ClientEvents } from 'discord.js';

import type { EventHandler } from '../types/bot';
import type { CreatedModule } from './createModule';

export const routeHandlers = (client: Client<true>, modules: CreatedModule[]) => {
  const eventNames = modules.flatMap(
    (module) => Object.keys(module.eventHandlers ?? {}) as (keyof ClientEvents)[],
  );
  const uniqueEventNames = [...new Set(eventNames)];

  uniqueEventNames.forEach((eventName) => {
    const eventHandlersToCall = modules
      .map((module) => module.eventHandlers?.[eventName])
      .filter((e): e is EventHandler => Boolean(e));

    client.on(eventName, async (...args) => {
      const handlersPromises = eventHandlersToCall.map(async (handler) => handler(...args));
      await Promise.allSettled(handlersPromises);
    });
  });
};
