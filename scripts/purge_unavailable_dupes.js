import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const junkOrDiscontinued = [
  'Starlight Vanilla',
  'Soleil Blanc',
  'Soleil Blanc (or similar summer collection equivalents)',
  'Soleil Blanc Inspired / Tropical Sunrise',
  'Peony & Blush Suede',
  'Orange Bitters',
  'Orange Blossom',
  'Destiny',
  'Rose Explosion',
  'Fruity Riot',
  'Fruity Chocolate',
  'Sunset On The Beach',
  'Sunset On Sunset Boulevard',
  'Electro Copper',
  'By The Glass',
  'Mojave Blossom',
  'Classic Boston',
  'Rain',
  'Flowering Fields',
  'Marshmallow Addict',
  'Solar Goddess',
  'Bergamote Sunset',
  'Captivating Memories',
  'Oud Energizing',
  'Cheirosa 39',
  'WG',
  'Bois Imperial (Refill)',
  'Ginger Biscuit inspired fragrances',
  'Rouge Malachite alternative',
  'Crystal Fragrance',
  'Floral Marshmallow',
  'Libre',
  'Libre Intense Equivalent',
  'Molecule',
  'Reflection',
  'Santal Royale',
  'Tygar',
  'Oud',
  'Omnia',
  'Alien Goddess Alternative',
  'Chloé Eau de Parfum inspired fragrance',
  'Cologne 352',
  "J'adore equivalent",
  'My Way equivalent',
  'Nomade equivalent',
  'Oud Maracuja alternative',
  'Sauvage Elixir Alternative',
  'The Noir 29 alternative',
  'Cheirosa 71 Impression'
];

async function runPurge() {
  console.log(`Starting purge of ${junkOrDiscontinued.length} unavailable/placeholder dupes...`);

  // 1. Delete all junk and discontinued dupes
  const { data: deleted, error: delErr } = await supabase
    .from('dupes')
    .delete()
    .in('name', junkOrDiscontinued)
    .select('id, brand, name');

  if (delErr) {
    console.error('Error during purge:', delErr);
    return;
  }
  console.log(`Successfully removed ${deleted?.length || 0} unavailable/discontinued dupes from the database.`);

  // 2. Clean dirty names
  console.log('Cleaning dupe names...');
  await supabase.from('dupes').update({ name: 'Asad' }).ilike('name', '%Asad (partial%');
  await supabase.from('dupes').update({ name: 'The Tux' }).ilike('name', '%The Tux / Avant%');
  await supabase.from('dupes').update({ name: 'Blue Talisman' }).ilike('name', '%Blue Talisman impression%');
  
  const { data: lisboa } = await supabase.from('dupes').select('id, name').ilike('name', '%Lisboa Aventured Into London%');
  for (const l of lisboa || []) {
    await supabase.from('dupes').update({ name: l.name.trim() }).eq('id', l.id);
  }

  // 3. Add genuine active dupes for the 3 affected perfumes
  const { data: lazySunday } = await supabase.from('perfumes').select('id').ilike('name', '%Lazy Sunday Morning%').maybeSingle();
  if (lazySunday) {
    await supabase.from('dupes').insert([{
      original_id: lazySunday.id,
      name: 'Musk Mood',
      brand: 'Lattafa',
      price: 18.00,
      similarity_match: 92,
      affiliate_link: 'https://www.notino.ie/search/?exps=Lattafa%20Musk%20Mood',
      uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Lattafa%20Musk%20Mood',
      notes: 'White Musk, Floral Notes, Citrus, Pure Clean Cotton'
    }]);
    console.log('Added Lattafa Musk Mood for Lazy Sunday Morning');
  }

  const { data: orangeBitters } = await supabase.from('perfumes').select('id').ilike('name', '%Orange Bitters%').maybeSingle();
  if (orangeBitters) {
    await supabase.from('dupes').insert([{
      original_id: orangeBitters.id,
      name: 'Orange & Cedarwood',
      brand: 'Jenny Glow',
      price: 14.99,
      similarity_match: 93,
      affiliate_link: 'https://www.notino.ie/search/?exps=Jenny%20Glow%20Orange',
      uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Jenny%20Glow%20Orange',
      notes: 'Bitter Orange, Sweet Mandarin, Amber, Sandalwood'
    }]);
    console.log('Added Jenny Glow Orange & Cedarwood for Orange Bitters');
  }

  const { data: cologne352 } = await supabase.from('perfumes').select('id').ilike('name', '%Cologne 352%').maybeSingle();
  if (cologne352) {
    await supabase.from('dupes').insert([{
      original_id: cologne352.id,
      name: 'Turathi Blue',
      brand: 'Afnan',
      price: 29.50,
      similarity_match: 92,
      affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20Turathi%20Blue',
      uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20Turathi%20Blue',
      notes: 'Fresh Citrus, Bergamot, Amber, Woody Notes'
    }]);
    console.log('Added Afnan Turathi Blue for Cologne 352');
  }

  // Final count
  const { count: finalCount } = await supabase.from('dupes').select('*', { count: 'exact', head: true });
  console.log(`\nCatalog audit complete! Total remaining active dupes: ${finalCount}`);
}

runPurge().catch(console.error);
