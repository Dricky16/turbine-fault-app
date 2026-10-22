import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  console.log('1. Updating Bad Femme direct link...');
  const { error: badFemmeErr } = await supabase
    .from('dupes')
    .update({
      affiliate_link: 'https://soghaat.co.uk/products/bad-femme-100ml-edp-by-maison-alhambra',
      uk_affiliate_link: 'https://soghaat.co.uk/products/bad-femme-100ml-edp-by-maison-alhambra',
      notes: 'Inspired by Carolina Herrera Good Girl. Stocked at UK & Ireland fragrance specialist Soghaat.'
    })
    .eq('id', '23ee87be-09fb-421c-91fd-28009a283aaf');

  if (badFemmeErr) console.error('Bad Femme err:', badFemmeErr);
  else console.log('Bad Femme updated with direct Soghaat link!');

  console.log('2. Updating Aldi Dark Blossom store links...');
  const { error: aldiErr } = await supabase
    .from('dupes')
    .update({
      affiliate_link: 'https://stores.aldi.ie/',
      uk_affiliate_link: 'https://www.aldi.co.uk/store-finder',
      notes: 'Supermarket Specialbuy (€6.99). In-store physical aisles only during seasonal releases.'
    })
    .eq('id', 'efcd3f51-df62-436a-9455-1b43a83e04b1');

  if (aldiErr) console.error('Aldi err:', aldiErr);
  else console.log('Aldi Dark Blossom updated with store finder links!');

  console.log('3. Adding Lattafa Qimmah for Women to Good Girl...');
  const originalIds = [
    '7502b457-65fe-414a-97c8-a79333b9286b', // Good Girl
    'e178f2bb-3150-4de9-917e-b24ed2e94ca3'  // Good Girl Eau de Parfum
  ];

  for (const origId of originalIds) {
    const { data: existing } = await supabase
      .from('dupes')
      .select('id')
      .eq('original_id', origId)
      .eq('brand', 'Lattafa')
      .ilike('name', '%Qimmah%');

    if (!existing || existing.length === 0) {
      const { error: insErr } = await supabase.from('dupes').insert({
        original_id: origId,
        brand: 'Lattafa',
        name: 'Qimmah for Women',
        price: 21.00,
        similarity_match: 92,
        notes: 'Inspired by Good Girl. Sweet gourmand almond, coffee, tuberose & tonka bean. Available online at Notino.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Lattafa%20Qimmah',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Lattafa%20Qimmah'
      });
      if (insErr) console.error('Insert Qimmah err for', origId, insErr);
      else console.log('Inserted Lattafa Qimmah for original:', origId);
    } else {
      console.log('Qimmah already exists for original:', origId);
    }
  }

  console.log('Done!');
}

run();
