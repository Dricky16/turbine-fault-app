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
  const { data: perfumes } = await supabase.from('perfumes').select('*');
  const { data: dupes } = await supabase.from('dupes').select('original_id');

  const dupeCounts = {};
  for (const d of dupes) {
    dupeCounts[d.original_id] = (dupeCounts[d.original_id] || 0) + 1;
  }

  const fuzzy = perfumes.filter(p => 
    p.name.toLowerCase().includes('million') || 
    p.brand.toLowerCase().includes('mugler') ||
    p.brand.toLowerCase().includes('paco')
  );

  fuzzy.forEach(p => {
    console.log(`${p.brand} - ${p.name} | ID: ${p.id} | Price: ${p.price} | Dupes: ${dupeCounts[p.id] || 0} | Img: ${p.image_url ? 'Yes' : 'No'}`);
  });
}
run();
