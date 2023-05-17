import { Client } from 'discord.js';

import { config } from './config';

const bootstrap = async (client: Client) => {
  await client.login(config.discord.token);

  await new Promise<void>((resolve) => {
    client.on('ready', () => {
      resolve();
    });
  });

  if (!client.isReady()) {
    throw new Error('Client should be ready at this stage');
  }
};

const client = new Client({
  intents: ['Guilds', 'GuildVoiceStates', 'GuildMembers'],
});

await bootstrap(client);

console.log('Bot started.');
