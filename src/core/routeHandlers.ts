import type { Client, ClientEvents } from 'discord.js';

import type { EventHandler } from '../types/bot';
import type { CreatedModule } from './createModule';
import { coreLogger } from './logger';

const handleEvent = async (
  eventHandlers: EventHandler[],
  ...args: ClientEvents[keyof ClientEvents]
) => {
  const handlersPromises = eventHandlers.map(async (handler) => handler(...args));
  await Promise.allSettled(handlersPromises);
};

export const routeHandlers = (client: Client<true>, modules: CreatedModule[]) => {
  const eventNames = modules.flatMap(
    (module) => Object.keys(module.eventHandlers ?? {}) as (keyof ClientEvents)[],
  );
  const uniqueEventNames = [...new Set(eventNames)];

  uniqueEventNames.forEach((eventName) => {
    const eventHandlersToCall = modules
      .map((module) => module.eventHandlers?.[eventName])
      .filter((e): e is EventHandler => Boolean(e));

    client.on(eventName, (...args) => void handleEvent(eventHandlersToCall, ...args));
  });
};
