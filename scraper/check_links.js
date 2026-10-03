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

async function run() {
  const { data: perfumes } = await supabase.from('perfumes').select('id, name, brand, affiliate_link');
  const { data: dupes, error } = await supabase.from('dupes').select('id, name, brand, affiliate_link');
  if (error) console.error("Dupes error:", error);
  
  let p_with_link = 0;
  let d_with_link = 0;
  
  perfumes.forEach(p => { if (p.affiliate_link) p_with_link++; });
  if (dupes) dupes.forEach(d => { if (d.affiliate_link) d_with_link++; });
  
  console.log(`Originals: ${perfumes.length} total, ${p_with_link} have explicit links`);
  console.log(`Dupes: ${dupes ? dupes.length : 0} total, ${d_with_link} have explicit links`);
}
run();
