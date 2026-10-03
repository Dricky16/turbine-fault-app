import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://www.notino.ie/search/?q=Perry+Ellis+360+Red', { waitUntil: 'networkidle2', timeout: 15000 });
  
  const html = await page.evaluate(() => document.body.innerText);
  console.log(html.substring(0, 1000));
  console.log("----------------------");
  console.log(html.includes("Perry Ellis"));
  
  await browser.close();
}
run();
