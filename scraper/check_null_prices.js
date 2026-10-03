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
  const nullPrices = perfumes.filter(p => p.price === null || p.price === undefined);
  console.log('Null prices count:', nullPrices.length);
  if (nullPrices.length > 0) {
    console.log(nullPrices);
  }
}
run();
