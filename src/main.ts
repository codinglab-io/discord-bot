import { Client } from 'discord.js';

import { createAllModules } from './core/createEnvForModule';
import { env } from './core/env';
import { getIntentsFromModules } from './core/getIntentsFromModules';
import { loadModules } from './core/loadModules';
import { coreLogger } from './core/logger';
import { modules } from './modules/modules';

const createdModules = await createAllModules(modules);

const client = new Client({
  intents: ['Guilds', ...getIntentsFromModules(createdModules)],
});

await client.login(env.discordToken);

await new Promise<void>((resolve) => {
  client.on('ready', () => {
    coreLogger.info(`Client is ready - ${client.user?.tag}!`);
    createdModules.map((module) => module.eventHandlers?.ready?.(client));
    resolve();
  });
});

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, createdModules);

coreLogger.info('Bot fully started.');
