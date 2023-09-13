import { Client } from 'discord.js';

import { config } from './config';
import { createModules } from './core/createModules';
import { getIntentsFromModules } from './core/getIntentsFromModules';
import { loadModules } from './core/loadModules';
import { modules } from './modules/modules';

const { discord } = config;

const createdModules = await createModules(modules);

const client = new Client({
  intents: ['Guilds', ...getIntentsFromModules(createdModules)],
});

await client.login(discord.token);

await new Promise<void>((resolve) => {
  client.on('ready', async () => {
    for (const module of createdModules) {
      await module.eventHandlers?.ready?.(client);
    }

    resolve();
  });
});

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, createdModules);

console.log('Bot started.');
