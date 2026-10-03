import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  async function getImg(query) {
    try {
      await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));
      // Try to click accept cookies if it appears
      try {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const accept = buttons.find(b => b.innerText.includes('Accept') || b.innerText.includes('Agree'));
          if (accept) accept.click();
        });
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {}

      const imgUrl = await page.evaluate(() => {
        // Google images stores the real URL in the DOM or we can just grab the first img src
        const imgs = Array.from(document.querySelectorAll('img'));
        for (let img of imgs) {
           if (img.src && img.src.startsWith('http') && !img.src.includes('gstatic') && img.width > 50) {
              return img.src;
           }
        }
        return null;
      });
      return imgUrl;
    } catch (e) {
      console.log('Error:', e.message);
      return null;
    }
  }

  // Fetch missing original images
  const { data: origs } = await supabase.from('perfumes').select('*').is('image_url', null);
  console.log(`Found ${origs.length} original perfumes missing images.`);
  for (const o of origs) {
    const url = await getImg(`${o.brand} ${o.name} perfume bottle isolated white background`);
    if (url) {
       console.log(`✅ ${o.name}: ${url.substring(0,40)}...`);
       await supabase.from('perfumes').update({ image_url: url }).eq('id', o.id);
    }
  }

  // Fetch missing dupe images
  const { data: dupes } = await supabase.from('dupes').select('*').is('image_url', null);
  console.log(`Found ${dupes.length} dupes missing images.`);
  for (const d of dupes) {
    const url = await getImg(`${d.brand} ${d.name} perfume bottle isolated white background`);
    if (url) {
       console.log(`✅ ${d.name}: ${url.substring(0,40)}...`);
       await supabase.from('dupes').update({ image_url: url }).eq('id', d.id);
    }
  }

  await browser.close();
})();
