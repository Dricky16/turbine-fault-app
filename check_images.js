import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: origs } = await supabase.from('perfumes').select('name, image_url');
  const origMissing = origs.filter(o => !o.image_url || o.image_url.includes('unsplash.com'));
  
  const { data: dupes } = await supabase.from('dupes').select('name, image_url');
  const dupesMissing = dupes.filter(d => !d.image_url || d.image_url.includes('unsplash.com'));
  
  console.log(`Originals with Unsplash/null images: ${origMissing.length} out of ${origs.length}`);
  console.log(`Dupes with Unsplash/null images: ${dupesMissing.length} out of ${dupes.length}`);
}
run();
