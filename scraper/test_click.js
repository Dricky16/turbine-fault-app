import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('.group.cursor-pointer'); // Wait for trending list
  
  console.log("Clicking first perfume in trending list...");
  await page.click('.group.cursor-pointer');
  
  await new Promise(r => setTimeout(r, 2000));
  console.log("Wait complete. Did it crash?");
  
  await browser.close();
}
run();
