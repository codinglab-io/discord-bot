import { z } from 'zod';

const envShape = z
  .object({
    DISCORD_TOKEN: z.string().nonempty(),
    REDIS_URL: z.string().url(),
  })
  .transform((object) => ({
    discordToken: object.DISCORD_TOKEN,
    redisUrl: object.REDIS_URL,
  }));

export const env = envShape.parse(process.env);
