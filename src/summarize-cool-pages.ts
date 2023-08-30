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

export type PageSummarizerDataSuccess = {
  success: true;
  html: string;
};

export type PageSummarizerDataFailure = {
  success: false;
  html?: undefined;
};

export type PageSummarizerData = PageSummarizerDataSuccess | PageSummarizerDataFailure;

export const isPageSummarizeSuccessData = (
  data: PageSummarizerData,
): data is PageSummarizerDataSuccess => {
  return data?.success && typeof data?.html === 'string';
};

export class NoContentFoundSummaryError extends Error {
  constructor(readonly pageUrl: string) {
    super();
    this.message = `Content Not Found for ${pageUrl}`;
    this.name = 'NotContentFoundError';
  }
}
export class PageSummarizerInvalidDataError extends Error {
  constructor(
    readonly pageUrl: string,
    readonly data?: PageSummarizerDataFailure,
  ) {
    super();
    this.message = `Invalid data for ${pageUrl}, check the third party API, received: ${JSON.stringify(
      data,
    )}`;
    this.name = 'PageSummarizerInvalidDataError';
  }
}
export const parseHtmlSummarized = ({
  html,
  url,
}: {
  html: string;
  url: string;
}): Promise<PageSummary> => {
  const $ = load(html);

  const title = $('.box.narrow h2').text();
  if (title === 'No content found') {
    throw new NoContentFoundSummaryError(url);
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
  const [dataError, data] = await resolveCatch(response.json() as Promise<PageSummarizerData>);
  if (dataError) {
    throw dataError;
  }
  // idk what's the type of data if success is false, I don't tried to make it crash
  if (isPageSummarizeSuccessData(data)) {
    const { html } = data;

    const [pageSummaryError, pageSummary] = await resolveCatch(
      parseHtmlSummarized({
        html,
        url: pageUrl,
      }),
    );
    if (pageSummaryError) {
      throw pageSummaryError;
    }
    return getPageSummaryDiscordView(pageSummary);
  }
  throw new PageSummarizerInvalidDataError(pageUrl, data);
};
