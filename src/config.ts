import env from 'env-var';

export const config = {
  discord: {
    token: env.get('DISCORD_TOKEN').required().asString(),
    clientId: env.get('DISCORD_CLIENT_ID').required().asString(),
    guildId: env.get('DISCORD_GUILD_ID').required().asString(),
    coolLinksChannelId: env.get('COOL_LINKS_CHANNEL_ID').required().asString(),
  },
  redis: {
    url: env.get('REDIS_URL').required().asString(),
  },
  thirdParties: {
    pageSummarizerBaseUrl: env.get('PAGE_SUMMARIZER_BASE_URL').required().asString(),
  },
};
