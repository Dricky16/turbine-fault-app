import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/search?q=site:notino.ie+Paco+Rabanne+1+Million');
  const link = await page.evaluate(() => {
    const el = document.querySelector('h2 a');
    return el ? el.href : null;
  });
  console.log('Bing link:', link);
  await browser.close();
})();
