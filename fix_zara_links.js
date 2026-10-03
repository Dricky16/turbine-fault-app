import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: dupes } = await supabase.from('dupes').select('*').ilike('brand', '%zara%');
  
  for (const dupe of dupes) {
    let updated = false;
    const updatePayload = {};

    if (dupe.affiliate_link && dupe.affiliate_link.includes('search.html')) {
       // Replace with Google I'm Feeling Lucky or direct Google search
       updatePayload.affiliate_link = `https://www.google.ie/search?q=site:zara.com/ie/en+Zara+${encodeURIComponent(dupe.name)}+perfume`;
       updated = true;
    }
    
    if (!dupe.uk_affiliate_link || dupe.uk_affiliate_link.includes('search.html')) {
       updatePayload.uk_affiliate_link = `https://www.google.co.uk/search?q=site:zara.com/uk/en+Zara+${encodeURIComponent(dupe.name)}+perfume`;
       updated = true;
    }

    if (updated) {
       await supabase.from('dupes').update(updatePayload).eq('id', dupe.id);
       console.log(`Updated Zara ${dupe.name}`);
    }
  }
  console.log("All Zara fallback links converted to Google Deep Searches");
}
run();
