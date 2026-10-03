import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const rawData = [
  ["Ex Nihilo", "Blue Talisman", 280, "Bergamot, Mandarin, Pear", "Orange Blossom", "Akigalawood, Ambrofix, Musk", [
    ["Fragrance World", "Blue Talisman", 35, 92],
    ["Spectra", "312 Blue", 25, 88],
    ["Maison Alhambra", "Blue Talisman", 30, 90]
  ]],
  ["Ex Nihilo", "Gold Immortals", 260, "Bergamot, Pear", "Peony, Lysylang", "Tonka Bean, Musk, Amber", [
    ["Fragrance World", "Gold Immortals", 35, 90],
    ["Paris Corner", "Golden Immortals", 30, 88]
  ]],
  ["Ex Nihilo", "Cologne 352", 220, "Italian Lemon, Juniper", "Lily of the Valley, Rose", "White Cedarwood, Guaiac Wood, Musk", [
    ["Maison Alhambra", "Cologne 352", 28, 85]
  ]],
  ["Ex Nihilo", "Viper Green", 260, "Green Mandarin, Galbanum", "Iris, Vetiver", "Patchouli, Vetiver, Woods", [
    ["Fragrance World", "Viper Green", 30, 85]
  ]],
  ["Ex Nihilo", "French Affair", 260, "Bergamot, Lychee", "Rose, Atlas Cedarwood", "Patchouli, Vetiver", [
    ["Paris Corner", "French Affair", 32, 88]
  ]],
  ["Ex Nihilo", "Brompton Immortals", 295, "Saffron, Pink Pepper", "Bulgarian Rose, Jasmine", "Madagascar Vanilla, Patchouli, Olibanum", [
    ["Maison Alhambra", "Brompton", 35, 90]
  ]],
  ["Ex Nihilo", "Oud Vendome", 260, "Saffron, Ginger", "Galbanum, Cedarwood", "Agarwood (Oud), Incense, Musk", [
    ["Fragrance World", "Vendome Oud", 30, 85]
  ]]
];

async function run() {
  console.log("Seeding Full Ex Nihilo Range...");
  for (const data of rawData) {
    const orig = {
      name: data[1],
      brand: data[0],
      price: data[2],
      notes: `${data[3]} | ${data[4]} | ${data[5]}`,
      image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
    };
    
    let origId;
    const { data: existing } = await supabase.from('perfumes').select('id').ilike('name', orig.name).ilike('brand', orig.brand).single();
    if (existing) {
      origId = existing.id;
    } else {
      const { data: inserted, error } = await supabase.from('perfumes').insert([orig]).select().single();
      if (error) console.error(error);
      else origId = inserted.id;
    }
    
    if (!origId) continue;

    for (const d of data[6]) {
      const dupe = {
        original_id: origId,
        brand: d[0],
        name: d[1],
        price: d[2],
        similarity_match: d[3],
        notes: `Inspired by ${data[1]}`,
        image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
      };
      
      const { data: exDupe } = await supabase.from('dupes').select('id').ilike('name', dupe.name).ilike('brand', dupe.brand).single();
      if (!exDupe) {
        await supabase.from('dupes').insert([dupe]);
        console.log(`Inserted ${dupe.brand} ${dupe.name}`);
      }
    }
  }
  console.log("Done seeding full Ex Nihilo range.");
}
run();
