import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('dupes').select('name, affiliate_link').is('affiliate_link', null);
  console.log("Count of null:", data ? data.length : 0);
  const { data: d2 } = await supabase.from('dupes').select('name, affiliate_link').eq('affiliate_link', '');
  console.log("Count of empty string:", d2 ? d2.length : 0);
}
run();
