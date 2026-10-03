import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const rawData = [
  ["Ex Nihilo", "Fleur Narcotique", 260, "Lychee, Bergamot, Peach", "Peony, Orange Blossom, Jasmine", "Musk, Moss, Wood", [
    ["Paris Corner", "Narcotic Flower", 35, 92],
    ["Afnan", "La Fleur Bouquet", 40, 95],
    ["Maison Alhambra", "Narcotic Flower", 30, 90]
  ]],
  ["Ex Nihilo", "Lust in Paradise", 260, "Pink Pepper", "Peony, Lychee", "White Cedarwood, Musk, Amber", [
    ["Paris Corner", "Lust", 35, 90],
    ["Maison Alhambra", "Paradise", 30, 88]
  ]],
  ["Ex Nihilo", "Sweet Morphine", 260, "Lilac, Bergamot", "Iris, Mimosa", "Vetiver, Patchouli, Bourbon Vanilla", [
    ["Fragrance World", "Sweet Addiction", 25, 85]
  ]],
  ["Ex Nihilo", "The Hedonist", 260, "Bergamot, Ginger", "Cedarwood, Akigalawood", "Vetiver, Musks, Tonka Bean", [
    ["Fragrance World", "The Hedonist", 35, 88]
  ]]
];

async function run() {
  console.log("Seeding Ex Nihilo...");
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
  console.log("Done Ex Nihilo.");
}
run();
