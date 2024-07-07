import { Client } from 'discord.js';

import { createAllModules } from './core/createEnvForModule';
import { env } from './core/env';
import { getIntentsFromModules } from './core/getIntentsFromModules';
import { loadModules } from './core/loadModules';
import { coolLinksManagement } from './modules/coolLinksManagement/coolLinksManagement.module';
import { fart } from './modules/fart/fart.module';
import { fixEmbedTwitterVideo } from './modules/fixEmbedTwitterVideo/fixEmbedTwitterVideo.module';
import { quoiFeur } from './modules/quoiFeur/quoiFeur.module';
import { recurringMessage } from './modules/recurringMessage/recurringMessage.module';
import { voiceOnDemand } from './modules/voiceOnDemand/voiceOnDemand.module';

const modules = [
  fart,
  voiceOnDemand,
  coolLinksManagement,
  quoiFeur,
  recurringMessage,
  fixEmbedTwitterVideo,
];

const createdModules = await createAllModules(modules);

const client = new Client({
  intents: ['Guilds', ...getIntentsFromModules(createdModules)],
});

await client.login(env.discordToken);

await new Promise<void>((resolve) => {
  client.on('ready', (client) => {
    void createdModules.map((module) => module.eventHandlers?.ready?.(client));
    resolve();
  });
});

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, createdModules);

coreLogger.info('Bot fully started.');
