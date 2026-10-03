import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: origs } = await supabase.from('perfumes').select('id, image_url').like('image_url', '%unsplash%');
  for (const o of origs) {
    await supabase.from('perfumes').update({ image_url: null }).eq('id', o.id);
  }
  
  const { data: dupes } = await supabase.from('dupes').select('id, image_url').like('image_url', '%unsplash%');
  for (const d of dupes) {
    await supabase.from('dupes').update({ image_url: null }).eq('id', d.id);
  }
  console.log(`Cleared ${origs.length} original images and ${dupes.length} dupe images.`);
}
run();
