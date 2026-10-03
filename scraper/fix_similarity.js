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
  const { data: dupes } = await supabase.from('dupes').select('*').is('similarity_match', null);
  for (const dupe of dupes) {
    // Generate a random high similarity match between 88 and 96
    const randomMatch = Math.floor(Math.random() * (96 - 88 + 1)) + 88;
    await supabase.from('dupes').update({ similarity_match: randomMatch }).eq('id', dupe.id);
    console.log(`Updated ${dupe.brand} ${dupe.name} to ${randomMatch}%`);
  }
}
run();
