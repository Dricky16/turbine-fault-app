import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data: dupes } = await supabase
    .from('dupes')
    .select('id, brand, name, notes')
    .or('brand.ilike.%aldi%,brand.ilike.%lidl%');

  console.log(`Found ${dupes.length} Aldi/Lidl dupes.`);

  let updated = 0;
  for (const d of dupes) {
    const isAldi = d.brand.toLowerCase().includes('aldi');
    const ieUrl = isAldi ? 'https://stores.aldi.ie/' : 'https://www.lidl.ie/c/store-finder/s10023403';
    const ukUrl = isAldi ? 'https://www.aldi.co.uk/store-finder' : 'https://www.lidl.co.uk/c/store-finder/s10023403';
    const baseNote = d.notes ? d.notes.replace(/Supermarket Specialbuy.*$/i, '').trim() : '';
    const note = baseNote 
      ? `${baseNote} (Supermarket in-store Specialbuy, €6-€7)`
      : `Supermarket Specialbuy (€6-€7). Physical supermarket aisles only during seasonal releases.`;

    await supabase.from('dupes').update({
      affiliate_link: ieUrl,
      uk_affiliate_link: ukUrl,
      notes: note
    }).eq('id', d.id);
    updated++;
  }

  console.log(`Successfully updated ${updated} supermarket dupes with clean store finder links and guidance!`);
}

run();
