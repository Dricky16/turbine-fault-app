import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return { valid: false, reason: `Status ${res.status}` };
    
    // Check if we got redirected to a generic homepage
    if (res.url.endsWith('notino.ie/') || res.url.endsWith('notino.co.uk/') || res.url === 'https://www.notino.ie' || res.url === 'https://www.notino.co.uk') {
        return { valid: false, reason: `Redirected to Notino homepage` };
    }
    
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

async function run() {
  console.log("Fetching all perfumes and dupes with explicit links...");
  const { data: perfumes } = await supabase.from('perfumes').select('id, name, brand, affiliate_link').not('affiliate_link', 'is', null);
  const { data: dupes } = await supabase.from('dupes').select('id, name, brand, affiliate_link').not('affiliate_link', 'is', null);
  
  const brokenLinks = [];
  
  console.log(`Checking ${perfumes.length} originals...`);
  for (const p of perfumes) {
    if (!p.affiliate_link) continue;
    process.stdout.write(`Checking ${p.brand} ${p.name}... `);
    const result = await checkUrl(p.affiliate_link);
    if (result.valid) {
        console.log("OK");
    } else {
        console.log("BROKEN (" + result.reason + ")");
        brokenLinks.push({ type: 'original', id: p.id, name: p.name, brand: p.brand, url: p.affiliate_link, reason: result.reason });
    }
  }
  
  console.log(`\nChecking ${dupes.length} dupes...`);
  for (const d of dupes) {
    if (!d.affiliate_link) continue;
    process.stdout.write(`Checking ${d.brand} ${d.name}... `);
    const result = await checkUrl(d.affiliate_link);
    if (result.valid) {
        console.log("OK");
    } else {
        console.log("BROKEN (" + result.reason + ")");
        brokenLinks.push({ type: 'dupe', id: d.id, name: d.name, brand: d.brand, url: d.affiliate_link, reason: result.reason });
    }
  }
  
  console.log(`\nFound ${brokenLinks.length} broken links.`);
  // Save to file
  import('fs').then(fs => {
    fs.writeFileSync('broken_links.json', JSON.stringify(brokenLinks, null, 2));
  });
}
run();
