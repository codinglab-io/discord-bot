const baseUrl = 'https://www.summarize.tech/api/summary';

export const getVideoSummary = async (videoUrl: string) => {
  const summary = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ url: videoUrl, deviceId: makeId(21) }),
    headers: { 'content-type': 'application/json' },
  })
    .then((res) => res.json())
    .then((res) =>
      (Object.values((res as SummaryResponse).rollups) ?? [])
        .map((chunk) => chunk.summary)
        .join(' '),
    );

  return summary;
};

const makeId = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

  return result;
};

// Example usage:
// const videoUrl = 'https://www.youtube.com/watch?v=ruUlK6zRwS8';
// const summary = await getVideoSummary(videoUrl);
// console.log({ summary });

type SummaryResponse = {
  rollups: Record<number, SummaryChunk>;
  title: string;
};

type SummaryChunk = {
  children: Record<number, string>;
  summary: string;
};
