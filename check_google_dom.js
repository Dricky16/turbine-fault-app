import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/search?tbm=isch&q=Creed+Aventus+perfume+bottle', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log(text);
  await browser.close();
})();
