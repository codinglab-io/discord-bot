import { MessageType } from 'discord.js';
import { z } from 'zod';

import { createModule } from '../../core/createModule';

const urlMappings = [
  {
    pattern: /https?:\/\/(mobile\.)?twitter\.com\/(\S+)\/status\/(\d+)/g,
    replacement: 'https://vxtwitter.com/$2/status/$3',
  },
];

export const patternReplace = createModule({
  env: {
    EXCLUDED_CHANNEL_ID: z.string().nonempty(),
  },
  eventHandlers: ({ env }) => ({
    messageCreate: async (message) => {
      if (
        message.author.bot ||
        message.type !== MessageType.Default ||
        message.channelId === env.EXCLUDED_CHANNEL_ID
      ) {
        return;
      }

      let modifiedContent = message.content;

      for (const { pattern, replacement } of urlMappings) {
        if (pattern.test(modifiedContent)) {
          modifiedContent = modifiedContent.replace(pattern, replacement);
        }
      }

      const hasModification = message.content !== modifiedContent;
      if (!hasModification) return;

      const newMessage = [`<@${message.author.id}>`, modifiedContent].join('\n');

      await message.channel.send(newMessage);
      await message.delete();
    },
  }),
  intents: ['GuildMessages', 'MessageContent'],
});
