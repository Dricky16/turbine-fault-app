import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: origs } = await supabase.from('perfumes').select('id, affiliate_link').like('affiliate_link', '%brownthomas.com/search%');
  for (const o of origs) {
    await supabase.from('perfumes').update({ affiliate_link: null }).eq('id', o.id);
  }
  console.log(`Cleared ${origs.length} hardcoded Brown Thomas search links.`);
}
run();
