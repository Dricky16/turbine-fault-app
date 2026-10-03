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
  const { data } = await supabase.from('dupes').select('*');
  
  const badNotinoLinks = data.filter(d => 
    d.affiliate_link && 
    d.affiliate_link.includes('club-de-nuit-man-intense') && 
    !d.name.toLowerCase().includes('club')
  );
  
  console.log('Dupes with Club De Nuit links that ARE NOT Club De Nuit:', badNotinoLinks.length);
  badNotinoLinks.forEach(b => console.log(b.name, b.brand));
}
run();
