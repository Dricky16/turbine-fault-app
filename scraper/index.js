import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Import adapters (we will build these next)
import scrapeNotino from './adapters/notino.js';
import scrapeZara from './adapters/zara.js';
import scrapeSuperdrug from './adapters/superdrug.js';
import scrapeNext from './adapters/next.js';
import scrapeMS from './adapters/marks_and_spencer.js';

puppeteer.use(StealthPlugin());

// Try to load env variables from root .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🚀 Starting Scents for Cents Master Scraper...");

  // 1. Fetch Dupes
  const { data: dupes, error: dupeError } = await supabase.from('dupes').select('*');
  if (dupeError) {
    console.error("Error fetching dupes:", dupeError);
    return;
  }

  // 2. Fetch Originals
  const { data: originals, error: origError } = await supabase.from('perfumes').select('*');
  if (origError) {
    console.error("Error fetching originals:", origError);
    return;
  }

  console.log(`📦 Found ${dupes.length} dupes and ${originals.length} originals to process.`);

  console.log("👻 Launching Stealth Browser...");
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // --- Process Originals (All via Notino) ---
  console.log("\n--- Scraping Originals (via Notino) ---");
  for (const orig of originals) {
    try {
      await scrapeNotino(browser, orig, supabase, 'perfumes', 'IE');
      await scrapeNotino(browser, orig, supabase, 'perfumes', 'UK');
    } catch (err) {
      console.error(`❌ Error scraping ${orig.name}:`, err.message);
    }
  }

  // --- Process Dupes ---
  console.log("\n--- Scraping Dupes ---");
  for (const dupe of dupes) {
    try {
      const brand = dupe.brand.toLowerCase();
      
      if (brand.includes("zara")) {
        await scrapeZara(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeZara(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("superdrug")) {
        await scrapeSuperdrug(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeSuperdrug(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("next")) {
        await scrapeNext(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeNext(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("marks") || brand.includes("m&s") || brand.includes("spencer")) {
        await scrapeMS(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeMS(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("lattafa") || brand.includes("armaf") || brand.includes("afnan") || brand.includes("maison alhambra") || brand.includes("fragrance world")) {
        // Middle eastern clones usually sold on Notino
        await scrapeNotino(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeNotino(browser, dupe, supabase, 'dupes', 'UK');
      }
      // In-store only brands
      else if (brand.includes("lidl") || brand.includes("aldi") || brand.includes("primark")) {
        console.log(`⏭️ Skipping in-store only brand: ${dupe.brand} - ${dupe.name}`);
      }
      else {
        console.log(`⚠️ No adapter yet for brand: ${dupe.brand} - ${dupe.name}`);
      }
    } catch (err) {
      console.error(`❌ Error scraping ${dupe.name}:`, err.message);
    }
  }

  console.log("\n✨ Scraping Run Complete!");
  await browser.close();
}

run();
