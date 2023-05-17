import env from 'env-var';

export const config = {
  discord: {
    token: env.get('DISCORD_TOKEN').required().asString(),
  },
};
