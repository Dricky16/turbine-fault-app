import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.from('perfumes').update({
    image_url: 'https://fimgs.net/mdimg/perfume/375x500.3747.jpg',
    affiliate_link: 'https://www.notino.ie/paco-rabanne/1-million-eau-de-toilette-for-men/'
  }).ilike('name', '%1 Million%');
  
  await supabase.from('dupes').update({
    image_url: 'https://fimgs.net/mdimg/perfume/375x500.41908.jpg'
  }).eq('name', 'Homme').eq('brand', 'Lidl');
  console.log("Fixed Paco Rabanne 1 Million and Lidl Homme");
}
run();
