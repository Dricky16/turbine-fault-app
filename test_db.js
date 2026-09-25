import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('perfumes').select('id, name, brand').ilike('name', '%Armani%');
  console.log("Armani matches:", data);
  
  const { data: gio } = await supabase.from('perfumes').select('id, name, brand').ilike('name', '%Gio%');
  console.log("Gio matches:", gio);
}
run();
