import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

puppeteer.use(StealthPlugin());
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching Notino dupes from database...");
  const { data: dupes, error } = await supabase
    .from('dupes')
    .select('*')
    .like('affiliate_link', '%notino.ie%');

  if (error) {
    console.error("Error fetching dupes:", error);
    return;
  }

  console.log(`Found ${dupes.length} Notino dupes to scrape.`);

  console.log("Launching Ghost Browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const dupe of dupes) {
    console.log(`\nScraping Notino for: ${dupe.brand} ${dupe.name}`);
    
    const searchUrl = `https://www.notino.ie/search/?q=${encodeURIComponent(dupe.brand + ' ' + dupe.name)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Wait a moment for dynamic content
    await new Promise(r => setTimeout(r, 2000));

    const product = await page.evaluate((brandName) => {
      // Find all links that look like products
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        // Look for the product card text
        const text = link.innerText || "";
        if (text.toLowerCase().includes(brandName.toLowerCase()) && text.includes('€')) {
           // We found a match! Let's extract the price
           const priceMatch = text.match(/([\d\.]+)\n*€/);
           return {
             url: link.href,
             price: priceMatch ? parseFloat(priceMatch[1]) : null
           };
        }
      }
      return null;
    }, dupe.brand);

    if (product && product.url) {
      console.log(`✅ Found! URL: ${product.url} | Price: €${product.price}`);
      
      // Update the database with the real link and exact live price
      await supabase
        .from('dupes')
        .update({ 
           affiliate_link: product.url,
           price: product.price || dupe.price
        })
        .eq('id', dupe.id);
        
    } else {
      console.log(`❌ Could not find an exact match on Notino.`);
    }
  }

  console.log("\nScraping complete!");
  await browser.close();
}

run();
