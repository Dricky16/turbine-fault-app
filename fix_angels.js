import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  await supabase.from('perfumes').update({
    image_url: 'https://images.selfridges.com/is/image/selfridges/R03704204_M'
  }).eq('name', 'Angels Share');
  
  await supabase.from('dupes').update({
    image_url: 'https://fimgs.net/mdimg/perfume/375x500.80373.jpg'
  }).eq('name', 'Kismet Angel');

  await supabase.from('dupes').update({
    image_url: 'https://fragranceworld.ae/wp-content/uploads/2023/10/Cocktail-Intense.jpg'
  }).eq('name', 'Cocktail Intense');
}
run();
