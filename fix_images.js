import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function getImageUrl(browser, query) {
  const page = await browser.newPage();
  try {
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images&iax=images`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('.tile--img__img');
      if (img && img.src && !img.src.includes('data:image')) {
         return img.src;
      }
      return null;
    });
    return imageUrl;
  } catch (e) {
    return null;
  } finally {
    await page.close();
  }
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  // Fix Originals
  const { data: origs } = await supabase.from('perfumes').select('id, name, brand, image_url');
  for (const o of origs) {
    if (!o.image_url || o.image_url.includes('unsplash.com')) {
       console.log(`Fetching image for Original: ${o.brand} ${o.name}`);
       const url = await getImageUrl(browser, `${o.brand} ${o.name} perfume bottle white background`);
       if (url) {
         await supabase.from('perfumes').update({ image_url: url }).eq('id', o.id);
         console.log(`✅ ${url}`);
       }
    }
  }

  // Fix Dupes
  const { data: dupes } = await supabase.from('dupes').select('id, name, brand, image_url');
  for (const d of dupes) {
    if (!d.image_url || d.image_url.includes('unsplash.com')) {
       console.log(`Fetching image for Dupe: ${d.brand} ${d.name}`);
       const url = await getImageUrl(browser, `${d.brand} ${d.name} perfume bottle white background`);
       if (url) {
         await supabase.from('dupes').update({ image_url: url }).eq('id', d.id);
         console.log(`✅ ${url}`);
       }
    }
  }

  await browser.close();
  console.log("All missing images updated!");
}
run();
