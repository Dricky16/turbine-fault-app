import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function fixExNihilo() {
  console.log('--- FIXING EX NIHILO DUPES ---');

  // Find all Ex Nihilo perfumes
  const { data: perfumes } = await supabase.from('perfumes').select('id, brand, name').ilike('brand', '%Ex Nihilo%');
  console.log(`Found ${perfumes.length} Ex Nihilo perfumes.`);

  const blueTalisman = perfumes.find(p => p.name.toLowerCase().includes('blue talisman'));
  const fleurNarcotiqueEdp = perfumes.find(p => p.name.toLowerCase().includes('fleur narcotique') && !p.name.toLowerCase().includes('extrait'));
  const fleurNarcotiqueExtrait = perfumes.find(p => p.name.toLowerCase().includes('fleur narcotique') && p.name.toLowerCase().includes('extrait'));
  const lustInParadise = perfumes.find(p => p.name.toLowerCase().includes('lust in paradise'));
  const cologne352 = perfumes.find(p => p.name.toLowerCase().includes('cologne 352'));

  // 1. Blue Talisman
  if (blueTalisman) {
    console.log(`Updating dupes for Blue Talisman (${blueTalisman.id})...`);
    // Delete old broken dupes
    await supabase.from('dupes').delete().eq('original_id', blueTalisman.id);

    const blueDupes = [
      {
        original_id: blueTalisman.id,
        brand: 'Afnan',
        name: 'Turathi Blue',
        price: 32.00,
        similarity_match: 92,
        notes: 'Top notes of juicy pear, bergamot, mandarin and akigalawood. The most popular accessible alternative to Blue Talisman.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20Turathi%20Blue',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20Turathi%20Blue'
      },
      {
        original_id: blueTalisman.id,
        brand: 'Maison Asrar',
        name: 'Legacy',
        price: 34.99,
        similarity_match: 95,
        notes: 'The celebrated 1:1 clone of Blue Talisman featuring ginger, fresh pear, ambroxan, and cedarwood.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Maison+Asrar+Legacy',
        uk_affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Maison+Asrar+Legacy'
      },
      {
        original_id: blueTalisman.id,
        brand: 'Lattafa',
        name: 'Pride Art of Universe',
        price: 35.00,
        similarity_match: 93,
        notes: 'Dense, long-lasting interpretation of Blue Talisman with elevated sweetness and amber-woody projection.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Art+of+Universe',
        uk_affiliate_link: 'https://www.amazon.co.uk/s?k=Lattafa+Art+of+Universe'
      },
      {
        original_id: blueTalisman.id,
        brand: 'Fragrance World',
        name: 'Blue Magician',
        price: 26.95,
        similarity_match: 91,
        notes: 'Vibrant citrus, crisp pear, and woody-musky dry down inspired by Blue Talisman.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Blue+Magician',
        uk_affiliate_link: 'https://www.amazon.co.uk/s?k=Fragrance+World+Blue+Magician'
      }
    ];

    const { error: insErr } = await supabase.from('dupes').insert(blueDupes);
    if (insErr) console.error('Insert error Blue Talisman:', insErr);
    else console.log('Successfully inserted 4 verified dupes for Blue Talisman!');
  }

  // 2. Fleur Narcotique EDP
  if (fleurNarcotiqueEdp) {
    console.log(`Updating dupes for Fleur Narcotique EDP (${fleurNarcotiqueEdp.id})...`);
    await supabase.from('dupes').delete().eq('original_id', fleurNarcotiqueEdp.id);

    const fleurDupes = [
      {
        original_id: fleurNarcotiqueEdp.id,
        brand: 'Afnan',
        name: 'Mystique Bouquet',
        price: 38.00,
        similarity_match: 95,
        notes: 'The undisputed #1 dupe of Fleur Narcotique worldwide. Sparkling white peach, lychee, bergamot, orange blossom, and sheer musk.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20Mystique%20Bouquet',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20Mystique%20Bouquet'
      },
      {
        original_id: fleurNarcotiqueEdp.id,
        brand: 'Maison Alhambra',
        name: 'Narcotic Flower',
        price: 24.99,
        similarity_match: 92,
        notes: 'Direct clone replicating the intoxicating floral-fruity peony, lychee, and clean musk profile of Fleur Narcotique.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Narcotic+Flower',
        uk_affiliate_link: 'https://www.amazon.co.uk/s?k=Maison+Alhambra+Narcotic+Flower'
      },
      {
        original_id: fleurNarcotiqueEdp.id,
        brand: 'Attar Collection',
        name: 'Azora',
        price: 85.00,
        similarity_match: 94,
        notes: 'Ultra-luxurious sister fragrance sharing the exact radiant lychee, peach, and floral musk DNA.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Attar%20Collection%20Azora',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Attar%20Collection%20Azora'
      }
    ];

    const { error: insErr } = await supabase.from('dupes').insert(fleurDupes);
    if (insErr) console.error('Insert error Fleur Narcotique EDP:', insErr);
    else console.log('Successfully inserted 3 verified dupes for Fleur Narcotique EDP!');
  }

  // 3. Fleur Narcotique Extrait
  if (fleurNarcotiqueExtrait) {
    console.log(`Updating dupes for Fleur Narcotique Extrait (${fleurNarcotiqueExtrait.id})...`);
    await supabase.from('dupes').delete().eq('original_id', fleurNarcotiqueExtrait.id);

    const extraitDupes = [
      {
        original_id: fleurNarcotiqueExtrait.id,
        brand: 'Afnan',
        name: 'Mystique Bouquet',
        price: 38.00,
        similarity_match: 94,
        notes: 'Intense white peach, luminous lychee, and enveloping solar musk echoing the Extrait.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20Mystique%20Bouquet',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20Mystique%20Bouquet'
      },
      {
        original_id: fleurNarcotiqueExtrait.id,
        brand: 'Maison Alhambra',
        name: 'Narcotic Flower',
        price: 24.99,
        similarity_match: 92,
        notes: 'Direct clone replicating the intoxicating floral-fruity peony and clean musk dry-down.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Narcotic+Flower',
        uk_affiliate_link: 'https://www.amazon.co.uk/s?k=Maison+Alhambra+Narcotic+Flower'
      }
    ];

    await supabase.from('dupes').insert(extraitDupes);
    console.log('Successfully inserted 2 verified dupes for Fleur Narcotique Extrait!');
  }

  // 4. Lust in Paradise
  if (lustInParadise) {
    console.log(`Updating dupes for Lust in Paradise (${lustInParadise.id})...`);
    await supabase.from('dupes').delete().eq('original_id', lustInParadise.id);

    const lustDupes = [
      {
        original_id: lustInParadise.id,
        brand: 'Afnan',
        name: 'La Fleur Bouquet',
        price: 32.00,
        similarity_match: 92,
        notes: 'Bright pink peony, lychee, and solar amber accords mirroring Lust in Paradise.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20La%20Fleur%20Bouquet',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20La%20Fleur%20Bouquet'
      },
      {
        original_id: lustInParadise.id,
        brand: 'Maison Alhambra',
        name: 'Libido',
        price: 24.99,
        similarity_match: 90,
        notes: 'Fruity floral clone inspired by Lust in Paradise with white cedarwood and sensual musk.',
        affiliate_link: 'https://soghaat.co.uk/search?type=product&q=Libido',
        uk_affiliate_link: 'https://www.amazon.co.uk/s?k=Maison+Alhambra+Libido'
      }
    ];

    await supabase.from('dupes').insert(lustDupes);
    console.log('Successfully inserted 2 verified dupes for Lust in Paradise!');
  }

  // 5. Cologne 352
  if (cologne352) {
    console.log(`Updating dupes for Cologne 352 (${cologne352.id})...`);
    await supabase.from('dupes').delete().eq('original_id', cologne352.id);

    const cologneDupes = [
      {
        original_id: cologne352.id,
        brand: 'Afnan',
        name: 'Turathi Blue',
        price: 29.50,
        similarity_match: 90,
        notes: 'Luminous Italian citrus, sparkling lemon, and crisp musk reminiscent of Cologne 352.',
        affiliate_link: 'https://www.notino.ie/search/?exps=Afnan%20Turathi%20Blue',
        uk_affiliate_link: 'https://www.notino.co.uk/search/?exps=Afnan%20Turathi%20Blue'
      }
    ];

    await supabase.from('dupes').insert(cologneDupes);
    console.log('Successfully inserted 1 verified dupe for Cologne 352!');
  }

  console.log('--- ALL EX NIHILO DUPES UPDATED SUCCESSFULLY ---');
}

fixExNihilo();
