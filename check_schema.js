import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('perfumes').select('*').limit(1);
  if (pData && pData.length > 0) {
    console.log("Perfumes columns:", Object.keys(pData[0]));
  }
  const { data: dData } = await supabase.from('dupes').select('*').limit(1);
  if (dData && dData.length > 0) {
    console.log("Dupes columns:", Object.keys(dData[0]));
  }
}
run();
