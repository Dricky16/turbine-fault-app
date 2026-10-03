import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import scrapeZara from './scraper/adapters/zara.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  // Get all Zara dupes
  const { data: zaraDupes } = await supabase.from('dupes').select('*').ilike('brand', '%Zara%');
  console.log(`Found ${zaraDupes.length} Zara dupes to scrape.`);
  
  for (const dupe of zaraDupes) {
     await scrapeZara(browser, dupe, supabase, 'dupes', 'IE');
     await scrapeZara(browser, dupe, supabase, 'dupes', 'UK');
  }
  
  await browser.close();
  console.log("Zara-only sweep complete!");
}
run();
