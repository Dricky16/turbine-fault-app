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

  // Count dupes per original
  const dupeCounts = {};
  for (const d of dupes) {
    dupeCounts[d.original_id] = (dupeCounts[d.original_id] || 0) + 1;
  }

  // Group by name + brand
  const groups = {};
  for (const p of perfumes) {
    const key = (p.name + '|||' + p.brand).toLowerCase().trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...p, dupeCount: dupeCounts[p.id] || 0 });
  }

  const duplicates = Object.values(groups).filter(g => g.length > 1);
  
  console.log(`Found ${duplicates.length} duplicate groups.`);
  
  duplicates.forEach(group => {
    console.log(`\n--- ${group[0].brand} - ${group[0].name} ---`);
    group.forEach(p => {
      console.log(`ID: ${p.id} | Price: ${p.price} | Dupes: ${p.dupeCount} | Img: ${p.image_url ? 'Yes' : 'No'}`);
    });
  });
}
run();
