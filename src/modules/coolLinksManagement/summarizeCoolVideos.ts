import { nanoid } from 'nanoid';
import { z } from 'zod';

const baseUrl = 'https://www.summarize.tech/api/summary';

// Example usage:
// const videoUrl = 'https://www.youtube.com/watch?v=ruUlK6zRwS8';
// const summary = await getVideoSummary(videoUrl);
// console.log({ summary });

const summarySchema = z.object({
  title: z.string(),
  rollups: z.record(
    z.coerce.number().int().gte(0),
    z.object({
      children: z.record(z.coerce.number().int().gte(0), z.string()),
      summary: z.object({
        before: z.string(),
        keyword: z.string(),
        after: z.string(),
      }),
    }),
  ),
});

export const getVideoSummary = async (videoUrl: string) =>
  fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ url: videoUrl, deviceId: nanoid(21) }),
    headers: { 'content-type': 'application/json' },
  })
    .then((res) => res.json())
    .then((json) => summarySchema.parse(json))
    .then((result) =>
      Object.values(result.rollups)
        .map(({ summary }) => summary.before + summary.keyword + summary.after)
        .join('\n')
        .replace(/\. /g, '.\n'),
    );
