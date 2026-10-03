import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  await supabase.from('perfumes').update({
    affiliate_link: 'https://www.selfridges.com/IE/en/cat/ex-nihilo-blue-talisman-eau-de-parfum_R04207949/',
    image_url: 'https://images.selfridges.com/is/image/selfridges/R04207949_M'
  }).eq('name', 'Blue Talisman');
  console.log("Blue Talisman original fixed.");
}
run();
