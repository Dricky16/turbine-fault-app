import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://www.zara.com/ie/en/search?searchTerm=Golden+Decade+perfume', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('zara.com') && h.includes('.html'));
  });
  
  console.log("Found links:", links.length);
  console.log(links.slice(0, 10));
  await browser.close();
}
run();
