import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: bt } = await supabase.from('perfumes').select('name, image_url').eq('name', 'Blue Talisman');
  console.log(bt);
  const { data: dupes } = await supabase.from('dupes').select('name, image_url').ilike('name', '%Blue Talisman%');
  console.log(dupes);
}
run();
