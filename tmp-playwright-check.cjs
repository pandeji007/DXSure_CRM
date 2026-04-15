const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.message));
  page.on('requestfailed', req => {
    const failure = req.failure();
    console.log('REQUESTFAILED', req.url(), failure?.errorText || 'unknown');
  });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const html = await page.content();
  console.log('HTML-LENGTH', html.length);
  await browser.close();
})();
