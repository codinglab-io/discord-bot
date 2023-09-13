import env from 'env-var';

export const config = {
  discord: {
    token: env.get('DISCORD_TOKEN').required().asString(),
  },
  redis: {
    url: env.get('REDIS_URL').required().asString(),
  },
};
