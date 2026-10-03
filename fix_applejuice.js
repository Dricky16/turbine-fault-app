import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // Delete "Apple Juice" (with a space)
  const { data: toDelete, error: err1 } = await supabase.from('dupes').delete().eq('name', 'Apple Juice').eq('brand', 'Zara');
  console.log("Deleted Apple Juice:", err1 ? err1 : "Success");

  // Fix "Applejuice" (no space)
  const { data: toUpdate, error: err2 } = await supabase.from('dupes').update({
    affiliate_link: 'https://www.zara.com/ie/en/applejuice-90-ml-p00120150.html',
    uk_affiliate_link: 'https://www.zara.com/uk/en/applejuice-90-ml-p00120150.html'
  }).eq('name', 'Applejuice').eq('brand', 'Zara');
  
  console.log("Updated Applejuice:", err2 ? err2 : "Success");
}
run();
