import { load } from 'cheerio';

// langfrom can't be changed to another language, this result in a translation of the summary that throw an HTTP error
// const parseBaseUrl = `${config.thirdParties.pageSummarizerBaseUrl}/convert.php?type=expand&lang=en&langfrom=user&url=`;

export type PageSummary = {
  title: string;
  keyFeatures: string[];
  readingTime: string;
};
export class NoContentFoundSummaryError extends Error {
  constructor() {
    super('No content found');
  }
}
export const parseHtmlSummarized = (html: string): Promise<PageSummary> => {
  const $ = load(html);

  const title = $('.box.narrow h2').text();
  if (title === 'No content found') {
    throw new NoContentFoundSummaryError();
  }
  const keyFeatures = $('.box.narrow ul li')
    .toArray()
    .map((li) => $(li).text());
  const readingTime = $('.time-to-read').text();

  return Promise.resolve({
    title,
    keyFeatures,
    readingTime,
  });
};

/* export const getCoolPageSummarized = async (url: string) => {
  const response = await fetch(url);
}; */
