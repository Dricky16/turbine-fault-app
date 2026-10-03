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
  
  const suspicious = [];
  
  for (let i=0; i<perfumes.length; i++) {
    for (let j=i+1; j<perfumes.length; j++) {
      const p1 = perfumes[i];
      const p2 = perfumes[j];
      
      if (p1.brand === p2.brand) {
        if (p1.name.includes(p2.name) || p2.name.includes(p1.name)) {
          suspicious.push([p1, p2]);
        }
      }
    }
  }
  
  console.log(`Found ${suspicious.length} potential duplicates.`);
  suspicious.forEach(pair => {
    console.log(`\nBrand: ${pair[0].brand}`);
    console.log(`1. ${pair[0].name} (ID: ${pair[0].id})`);
    console.log(`2. ${pair[1].name} (ID: ${pair[1].id})`);
  });
}
run();
