const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.notino.ie/search/?q=delina', { waitUntil: 'networkidle2' });
  
  const html = await page.evaluate(() => {
    // try to find the product list or grid
    const products = document.querySelectorAll('a');
    let results = [];
    for (let a of products) {
      if (a.href.includes('/parfums-de-marly/delina-eau-de-parfum') || a.href.includes('parfum')) {
        results.push({ href: a.href, text: a.innerText });
      }
    }
    return results.slice(0, 5);
  });
  
  console.log(html);
  await browser.close();
}
run();
