import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: dupes } = await supabase.from('dupes').select('*').ilike('brand', '%zara%');
  
  for (const dupe of dupes) {
     await supabase.from('dupes').update({
       affiliate_link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + dupe.name + ' perfume Ireland')}`,
       uk_affiliate_link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + dupe.name + ' perfume UK')}`
     }).eq('id', dupe.id);
  }
  console.log("Updated ALL Zara links unconditionally to Google Shopping.");
}
run();
