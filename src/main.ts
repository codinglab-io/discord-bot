import { Client } from 'discord.js';

import { bootstrap } from './bootstrap';

const client = new Client({
  intents: ['Guilds', 'GuildVoiceStates', 'GuildMembers'],
});

await bootstrap(client);

console.log('Bot started.');
