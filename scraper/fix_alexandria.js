import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: dupes } = await supabase.from('dupes').select('*').ilike('brand', '%Alexandria%');
  for (const dupe of dupes) {
    const query = encodeURIComponent(dupe.name.toLowerCase().includes('alexandria') ? dupe.name : `Alexandria Fragrances ${dupe.name}`);
    const correctLink = `https://alexandriafragrances.co.uk/search?q=${query}`;
    await supabase.from('dupes').update({ affiliate_link: correctLink, uk_affiliate_link: correctLink }).eq('id', dupe.id);
    console.log(`Updated ${dupe.name} to ${correctLink}`);
  }
}
run();
