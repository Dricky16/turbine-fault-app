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

const newPerfumes = [
  { brand: 'Diesel', name: 'Only The Brave', dupes: [
    { brand: 'Milton Lloyd', name: 'The Man Cobalt', price: 5.50 },
    { brand: 'La Rive', name: 'Brave', price: 9.99 }
  ]},
  { brand: 'Diesel', name: 'Loverdose', dupes: [
    { brand: 'La Rive', name: 'Love Dance', price: 10.50 }
  ]},
  { brand: 'Calvin Klein', name: 'CK One', dupes: [
    { brand: 'Zara', name: 'Everyone', price: 15.95 },
    { brand: 'Milton Lloyd', name: 'America', price: 5.50 }
  ]},
  { brand: 'Calvin Klein', name: 'Euphoria', dupes: [
    { brand: 'Milton Lloyd', name: 'Hawaii', price: 5.50 }
  ]},
  { brand: 'Tom Ford', name: 'Cherry Smoke', dupes: [
    { brand: 'Maison Alhambra', name: 'Lovely Chérie', price: 25.00 },
    { brand: 'Fragrance World', name: 'Lush Cherry', price: 22.00 }
  ]},
  { brand: 'Jo Malone', name: 'Blackberry & Bay', dupes: [
    { brand: 'Jenny Glow', name: 'Berry & Bay', price: 14.99 },
    { brand: 'Aldi', name: 'Blackberry & Bay', price: 6.99 }
  ]},
  { brand: 'Maison Francis Kurkdjian', name: 'Oud Satin Mood', dupes: [
    { brand: 'Maison Alhambra', name: 'Baroque Satin Oud', price: 25.00 },
    { brand: 'Lattafa', name: 'Oud Mood', price: 19.99 }
  ]},
  { brand: 'Ariana Grande', name: 'Cloud', dupes: [
    { brand: 'Zara', name: 'Red Temptation Summer', price: 22.95 },
    { brand: 'Lattafa', name: 'Yara', price: 20.00 }
  ]}
];

async function run() {
  for (const item of newPerfumes) {
    const { data: original, error: origError } = await supabase
      .from('perfumes')
      .insert({ brand: item.brand, name: item.name })
      .select('id')
      .single();

    if (origError) {
      console.error(`Error inserting ${item.name}:`, origError.message);
      continue;
    }

    for (const dupe of item.dupes) {
      const { error: dupeError } = await supabase
        .from('dupes')
        .insert({
          original_id: original.id,
          brand: dupe.brand,
          name: dupe.name,
          price: dupe.price
        });
      
      if (dupeError) {
        console.error(`  Error inserting dupe ${dupe.name}:`, dupeError.message);
      } else {
        console.log(`✅ Added ${item.brand} ${item.name} -> ${dupe.brand} ${dupe.name}`);
      }
    }
  }
}
run();
