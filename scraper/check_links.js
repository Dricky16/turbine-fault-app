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
  const { data: perfumes } = await supabase.from('perfumes').select('brand, name, affiliate_link');
  const { data: dupes } = await supabase.from('dupes').select('brand, name, affiliate_link');
  
  const missingPerfumes = perfumes.filter(p => !p.affiliate_link);
  const missingDupes = dupes.filter(d => !d.affiliate_link);
  
  console.log(`Perfumes: ${perfumes.length - missingPerfumes.length} / ${perfumes.length} have links`);
  console.log(`Dupes: ${dupes.length - missingDupes.length} / ${dupes.length} have links`);
  console.log('Total Missing:', missingPerfumes.length + missingDupes.length);
  
  if (missingPerfumes.length > 0) {
     console.log('\nMissing Perfume Links:');
     missingPerfumes.slice(0, 10).forEach(p => console.log(`- ${p.brand} ${p.name}`));
  }
  if (missingDupes.length > 0) {
     console.log('\nMissing Dupe Links:');
     missingDupes.slice(0, 10).forEach(d => console.log(`- ${d.brand} ${d.name}`));
  }
}
run();
