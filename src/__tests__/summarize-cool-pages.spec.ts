import { afterEach } from 'node:test';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPageSummaryDiscordView,
  NoContentFoundSummaryError,
  parseHtmlSummarized,
} from '../summarize-cool-pages';

const createSummarizeCoolPagesFixture = () => {
  return {
    // from https://react.dev/learn/you-might-not-need-an-effect
    htmlWithSummaryContent: `        <div dir=\"auto\" class=\"box narrow\">\n        <h2>You Might Not Need an Effect – React<\/h2>\n        <ul>\n          <li>Effects in React are used to synchronize components with external systems, but they are not always necessary.<\/li><li>Effects should not be used to transform data for rendering or handle user events.<\/li><li>Unnecessary Effects can be removed to make the code simpler, faster, and less error-prone.<\/li><li>In cases where Effects are needed, it is important to handle race conditions and clean up after the Effect.<\/li>        <\/ul>\n    <\/div>\n    <div class=\"box\">\n        <p style=\"padding:20px 0 0 0;\" class=\"developers\">\n                    <a class=\"btn\" href=\"\/en\/https:\/\/react.dev\/learn\/you-might-not-need-an-effect\">Condense<\/a>                  <\/p>\n    <\/div>\n    <div class=\"box\">\n        <p class=\"time-to-read\" style=\"font-style: italic\" style=\"padding:20px 0 0 0;\">26-minute read<\/p>\n        <p class=\"developers shortcuts\"><a href=\"https:\/\/react.dev\/learn\/you-might-not-need-an-effect\">Read full article<\/a> &middot; <a href=\"https:\/\/pushtokindle.fivefilters.org\/send.php?url=https%3A%2F%2Freact.dev%2Flearn%2Fyou-might-not-need-an-effect\">Push to Kindle<\/a> &middot; <a href=\"https:\/\/txtify.it\/https:\/\/react.dev\/learn\/you-might-not-need-an-effect\">txtify.it<\/a><\/p>\n    <\/div>\n`,
    htmlContentNotFound: `        <div dir=\"auto\" class=\"box narrow\">\n        <h2>No content found<\/h2>\n        <ul>\n                  <\/ul>\n    <\/div>\n    <div class=\"box\">\n        <p style=\"padding:20px 0 0 0;\" class=\"developers\">\n                              <a class=\"btn\" href=\"\/\">Home<\/a>        <\/p>\n    <\/div>\n    <div class=\"box\">\n        <p class=\"time-to-read\" style=\"font-style: italic\" style=\"padding:20px 0 0 0;\">0-minute read<\/p>\n        <p class=\"developers shortcuts\"><a href=\"https:\/\/react.dev\/learn\/you-might-not-need-an-effec\">Read full article<\/a> &middot; <a href=\"https:\/\/pushtokindle.fivefilters.org\/send.php?url=https%3A%2F%2Freact.dev%2Flearn%2Fyou-might-not-need-an-effec\">Push to Kindle<\/a> &middot; <a href=\"https:\/\/txtify.it\/https:\/\/react.dev\/learn\/you-might-not-need-an-effec\">txtify.it<\/a><\/p>\n    <\/div>\n`,
    pageSummary: {
      title: 'You Might Not Need an Effect – React',
      keyFeatures: [
        'Effects in React are used to synchronize components with external systems, but they are not always necessary.',
        'Effects should not be used to transform data for rendering or handle user events.',
        'Unnecessary Effects can be removed to make the code simpler, faster, and less error-prone.',
        'In cases where Effects are needed, it is important to handle race conditions and clean up after the Effect.',
      ],
      readingTime: '26-minute read',
    },
    pageSummaryDiscordView: `**You Might Not Need an Effect – React** \n- Effects in React are used to synchronize components with external systems, but they are not always necessary.\n- Effects should not be used to transform data for rendering or handle user events.\n- Unnecessary Effects can be removed to make the code simpler, faster, and less error-prone.\n- In cases where Effects are needed, it is important to handle race conditions and clean up after the Effect.\n⌛ 26-minute read`,
  };
};
type SummarizeCoolPagesFixture = ReturnType<typeof createSummarizeCoolPagesFixture>;
describe('Feature: summarize cool pages', () => {
  let fixture: SummarizeCoolPagesFixture;
  beforeEach(() => {
    // config is mocked to avoid to call the third party API and to avoid to handle env-var
    vi.mock('../config', async () => ({
      config: (await import('./mocks/config.mock')).default,
    }));
    // useless atm but will be useful when we will have to reset the fixture
    fixture = createSummarizeCoolPagesFixture();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  describe('Rule: parseHtmlSummarized() should parse an html content', () => {
    it('parseHtmlSummarized() should return a PageSummary with an html with a summary content', async () => {
      const html = fixture.htmlWithSummaryContent;
      const result = await parseHtmlSummarized(html);
      expect(result).toEqual(fixture.pageSummary);
    });
    it('parseHtmlSummarized() should throw a NoContentFoundSummaryError when the html content is not found', async () => {
      const html = fixture.htmlContentNotFound;
      try {
        await parseHtmlSummarized(html);
      } catch (error) {
        expect(error).toBeInstanceOf(NoContentFoundSummaryError);
      }
    });
  });
  it('getPageSummaryDiscordView() should return a string with the page summary', () => {
    expect(getPageSummaryDiscordView(fixture.pageSummary)).toEqual(fixture.pageSummaryDiscordView);
  });
});
