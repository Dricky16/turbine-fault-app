import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Must use service role to update
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('dupes').select('*');
  
  const badNotinoLinks = data.filter(d => 
    d.affiliate_link && 
    d.affiliate_link.includes('club-de-nuit-man-intense') && 
    !d.name.toLowerCase().includes('club')
  );
  
  for (const b of badNotinoLinks) {
    const { error } = await supabase
      .from('dupes')
      .update({
        affiliate_link: null,
        uk_affiliate_link: null,
        image_url: null
      })
      .eq('id', b.id);
      
    if (error) console.error("Error updating", b.name, error);
    else console.log("Fixed:", b.name);
  }
}
run();
