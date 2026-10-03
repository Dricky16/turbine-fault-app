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
  const { data: dupes } = await supabase.from('dupes').select('brand');
  
  const notinoBrands = ['Lattafa', 'Armaf', 'Maison Alhambra', 'Fragrance World', 'Afnan', 'La Rive', 'Al Haramain'];
  
  let notinoCount = 0;
  dupes.forEach(d => {
    if (notinoBrands.some(b => d.brand.toLowerCase().includes(b.toLowerCase()))) {
      notinoCount++;
    }
  });
  
  console.log(`Notino-compatible dupes in our app: ${notinoCount}`);
}
run();
