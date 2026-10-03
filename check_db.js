import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: bt } = await supabase.from('perfumes').select('*').eq('name', 'Blue Talisman');
  console.log("Blue Talisman original:", bt);
  
  const { data: dupes } = await supabase.from('dupes').select('name, brand, image_url, affiliate_link').ilike('name', '%Blue Talisman%');
  console.log("Blue Talisman dupes:", dupes);
  
  const { data: angels } = await supabase.from('perfumes').select('*').eq('name', 'Angels Share');
  console.log("Angels Share original:", angels);
}
run();
