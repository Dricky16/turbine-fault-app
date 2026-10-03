import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.notino.ie/search/?q=Perry+Ellis+360+Red', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const results = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(l => l.innerText).filter(t => t.includes('Perry') && t.includes('€'));
  });
  
  console.log(results);
  await browser.close();
}
run();
