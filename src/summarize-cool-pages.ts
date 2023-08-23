import { load } from 'cheerio';

import { config } from './config';
import { resolveCatch } from './helpers/resolve-catch.helper';
// langfrom can't be changed to another language, this result in a translation of the summary that throw an HTTP error because we are in "FREE PLAN"
const parseBaseUrl = `${config.thirdParties.pageSummarizerBaseUrl}/convert.php?type=expand&lang=en&langfrom=user&url=`;

type PageSummary = {
  title: string;
  keyFeatures: string[];
  readingTime: string;
};

type PageSummarizerDataSuccess = {
  success: true;
  html: string;
};

type PageSummarizerDataFailure = {
  success: false;
  html?: undefined;
};

type PageSummarizerData = PageSummarizerDataSuccess | PageSummarizerDataFailure;

const isPageSummarizeSuccessData = (
  data: PageSummarizerData,
): data is PageSummarizerDataSuccess => {
  return data?.success && typeof data?.html === 'string';
};

export class NoContentFoundSummaryError extends Error {
  constructor() {
    super(`No content found in ${parseBaseUrl}`);
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

export const getPageSummaryDiscordView = (pageSummary: PageSummary) => {
  const { title, keyFeatures, readingTime } = pageSummary;
  return `**${title}** \n${keyFeatures
    .map((keyFeature) => `- ${keyFeature}`)
    .join('\n')}\n⌛ ${readingTime}`;
};

export const getPageSummary = async (pageUrl: string) => {
  const [responseError, response] = await resolveCatch(
    fetch(`${parseBaseUrl}${pageUrl}`, { method: 'GET' }),
  );
  if (responseError) {
    throw responseError;
  }
  const [dataError, data]: [Error | null, PageSummarizerData | null | undefined] =
    await resolveCatch(response.json());
  if (dataError) {
    throw dataError;
  }
  // idk what's the type of data if success is false, I don't tried to make it crash
  if (data && isPageSummarizeSuccessData(data)) {
    const { html } = data;

    const [pageSummaryError, pageSummary] = await resolveCatch(parseHtmlSummarized(html));
    if (pageSummaryError) {
      throw pageSummaryError;
    }
    return getPageSummaryDiscordView(pageSummary);
  }
  throw new Error('Page summarization failed');
};
