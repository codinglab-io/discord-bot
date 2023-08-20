import { chromium } from 'playwright';

const summarizeUrl = 'https://www.summarize.tech/';

export const getVideoSummary = async (videoUrl: string) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(summarizeUrl + videoUrl.replace('https://', '').replace('http://', ''));

  const getSummary = async () => {
    const startTime = await page.getByRole('link', { name: '00:00:00' }).elementHandle();
    if (!startTime) return;

    const summaryEl = await startTime.evaluateHandle(
      (node) => node.parentElement?.nextElementSibling,
    );
    if (!summaryEl) return;

    return summaryEl.asElement()?.innerText();
  };
  const summary = await getSummary();
  if (!summary) return;

  // Teardown
  await context.close();
  await browser.close();

  return summary;
};

// Example usage:
// const videoUrl = 'https://www.youtube.com/watch?v=ruUlK6zRwS8';
// const summary = await getVideoSummary(videoUrl);
