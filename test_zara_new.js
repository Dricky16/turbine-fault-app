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
  const product = { id: 'd0ff9e58-e7e0-474d-acc7-ecbe83cd49aa', name: 'Golden Decade', brand: 'Zara' };
  
  await scrapeZara(browser, product, supabase, 'dupes', 'IE');
  
  await browser.close();
}
run();
