import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function runStealthScraper() {
  console.log("🚀 Starting Stealth Background Scraper...");
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox']
  });

  // Get all items missing an affiliate_link
  const { data: perfumes } = await supabase.from('perfumes').select('*').is('affiliate_link', null);
  const { data: dupes } = await supabase.from('dupes').select('*').is('affiliate_link', null);
  
  const allItems = [...(perfumes || []), ...(dupes || [])];
  console.log(`Found ${allItems.length} items missing direct links.`);

  for (const item of allItems) {
    const isZara = item.brand.toLowerCase().includes('zara');
    console.log(`\n🔍 Searching exact link for: ${item.brand} - ${item.name}`);
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      // Stealthy user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
      
      if (isZara) {
         const searchUrl = `https://www.zara.com/ie/en/search.html?searchTerm=${encodeURIComponent(item.name)}`;
         await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
         await delay(5000); // Wait for Zara SPA to load
         
         const directLink = await page.evaluate(() => {
            const a = document.querySelector('a.product-link');
            return a ? a.href : null;
         });
         
         if (directLink) {
            console.log(`✅ Found direct Zara link: ${directLink}`);
            await supabase.from(item.original_id ? 'dupes' : 'perfumes').update({ affiliate_link: directLink }).eq('id', item.id);
         }
      } else {
         const searchUrl = `https://www.notino.ie/search/?q=${encodeURIComponent(item.brand + ' ' + item.name)}`;
         await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
         await delay(5000);
         
         const directLink = await page.evaluate(() => {
            // Find first product tile link
            const a = document.querySelector('a[href*="/' + document.domain.replace('www.','') + '"]');
            return a && a.href.includes(document.domain) ? a.href : null;
         });
         
         if (directLink && directLink.length > 25) {
            console.log(`✅ Found direct Notino link: ${directLink}`);
            await supabase.from(item.original_id ? 'dupes' : 'perfumes').update({ affiliate_link: directLink }).eq('id', item.id);
         }
      }
      
      await page.close();
      
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
    
    // The most important part: pause for 10-15 seconds to avoid IP bans
    const pauseTime = Math.floor(Math.random() * 5000) + 10000;
    console.log(`😴 Sleeping for ${pauseTime/1000} seconds to avoid bot detection...`);
    await delay(pauseTime);
  }
  
  await browser.close();
  console.log("🎉 Stealth scraper finished!");
}

runStealthScraper();
