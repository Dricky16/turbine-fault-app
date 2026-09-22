import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.from('perfumes').update({ notes: 'Top: Peppermint, Lavender. Heart: Spicy Coriander, Jasmine, Oak Geranium. Base: Amber, Musk.' }).ilike('name', '%Cool Water%');
  await supabase.from('dupes').update({ notes: 'Top: Mint, Green nuances. Heart: Lavender, Jasmine. Base: Musk, Amber.' }).ilike('name', '%Aqua Fresh%');
  
  await supabase.from('perfumes').update({ notes: 'Top: Saffron, Jasmine. Heart: Amberwood, Ambergris. Base: Fir Resin, Cedar.' }).ilike('name', '%Baccarat Rouge 540%');
  await supabase.from('dupes').update({ notes: 'Top: Saffron, Jasmine. Heart: Amberwood. Base: Fir Resin, Cedar.' }).ilike('name', '%Red Edition%');

  await supabase.from('perfumes').update({ notes: 'Top: King William Pear. Heart: Freesia. Base: Patchouli.' }).ilike('name', '%Pear & Freesia%');
  await supabase.from('dupes').update({ notes: 'Top: Pear, Melon. Heart: Freesia, Rose. Base: Musk, Patchouli.' }).ilike('name', '%Pear%');

  console.log("Updated a few notes!");
}
run();
