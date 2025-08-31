#!/usr/bin/env node
const { chromium } = require('playwright');

async function main() {
  const url =
    process.env.OVERVIEW_URL || 'http://localhost:7007/?path=/story/docs-portfolio-overview--page';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Portfolio Overview', { timeout: 15000 });
  await page.pdf({ path: 'docs/PortfolioOverview.pdf', format: 'A4', printBackground: true });
  await browser.close();
  console.log('Exported docs/PortfolioOverview.pdf');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
