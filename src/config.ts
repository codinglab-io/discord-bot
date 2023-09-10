import env from 'env-var';

export const config = {
  discord: {
    token: env.get('DISCORD_TOKEN').required().asString(),
    coolLinksChannelId: env.get('COOL_LINKS_CHANNEL_ID').required().asString(),
  },
  redis: {
    url: env.get('REDIS_URL').required().asString(),
  },
  thirdParties: {
    pageSummarizerBaseUrl: env.get('PAGE_SUMMARIZER_BASE_URL').required().asString(),
  },
};
