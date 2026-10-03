import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Must use SERVICE_ROLE key to bypass RLS policies
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

const newAdditions = [
  // LIDL DUPES
  { originalBrand: 'Chloe', originalName: 'Chloe Eau de Parfum', dupeBrand: 'Lidl', dupeName: 'Suddenly Chalou', price: 5.99 },
  { originalBrand: 'Lancome', originalName: 'La Vie Est Belle', dupeBrand: 'Lidl', dupeName: 'Suddenly Femelle', price: 5.99 },
  { originalBrand: 'Dior', originalName: 'J\\'adore', dupeBrand: 'Lidl', dupeName: 'Suddenly Lovely', price: 5.99 },
  { originalBrand: 'Narciso Rodriguez', originalName: 'For Her', dupeBrand: 'Lidl', dupeName: 'Suddenly d\\'Elle', price: 5.99 },
  { originalBrand: 'Dolce & Gabbana', originalName: 'Light Blue', dupeBrand: 'Lidl', dupeName: 'Suddenly Blue', price: 5.99 },
  { originalBrand: 'Hugo Boss', originalName: 'Boss Bottled', dupeBrand: 'Lidl', dupeName: 'Gibellini X-Bolt', price: 5.99 },
  { originalBrand: 'Paco Rabanne', originalName: '1 Million', dupeBrand: 'Lidl', dupeName: 'Gibellini No. 1', price: 5.99 },
  { originalBrand: 'Giorgio Armani', originalName: 'Acqua Di Gio', dupeBrand: 'Lidl', dupeName: 'Gibellini Aqua Fresh', price: 5.99 },
  
  // ALDI DUPES
  { originalBrand: 'Viktor&Rolf', originalName: 'Flowerbomb', dupeBrand: 'Aldi', dupeName: 'Lacura Floral Love', price: 6.99 },
  { originalBrand: 'Paco Rabanne', originalName: 'Olympea', dupeBrand: 'Aldi', dupeName: 'Lacura Luxe', price: 6.99 },
  { originalBrand: 'Lancome', originalName: 'La Vie Est Belle', dupeBrand: 'Aldi', dupeName: 'Lacura Je Suis Belle', price: 6.99 },
  { originalBrand: 'Maison Francis Kurkdjian', originalName: 'Baccarat Rouge 540', dupeBrand: 'Aldi', dupeName: 'Lacura Cardinal Red', price: 6.99 },
  { originalBrand: 'Jean Paul Gaultier', originalName: 'Le Male', dupeBrand: 'Aldi', dupeName: 'Lacura Gentleman', price: 6.99 },
  { originalBrand: 'Paco Rabanne', originalName: 'Invictus', dupeBrand: 'Aldi', dupeName: 'Lacura Conflict', price: 6.99 },
  { originalBrand: 'Paco Rabanne', originalName: '1 Million', dupeBrand: 'Aldi', dupeName: 'Lacura Power', price: 6.99 },
  { originalBrand: 'Dior', originalName: 'Sauvage', dupeBrand: 'Aldi', dupeName: 'Lacura Ferocious', price: 6.99 }
];

async function run() {
  for (const item of newAdditions) {
    // 1. Find or create the original perfume
    let { data: original, error: origSearchError } = await supabase
      .from('perfumes')
      .select('id')
      .ilike('brand', `%${item.originalBrand}%`)
      .ilike('name', `%${item.originalName}%`)
      .limit(1)
      .maybeSingle();

    if (!original) {
       console.log(`Original not found, creating: ${item.originalBrand} - ${item.originalName}`);
       const { data: newOrig, error: insertOrigError } = await supabase
         .from('perfumes')
         .insert({ brand: item.originalBrand, name: item.originalName })
         .select('id')
         .single();
         
       if (insertOrigError) {
          console.error('Error inserting original:', insertOrigError.message);
          continue;
       }
       original = newOrig;
    }

    // 2. Check if dupe already exists to prevent duplicates
    const { data: existingDupe } = await supabase
      .from('dupes')
      .select('id')
      .eq('original_id', original.id)
      .ilike('brand', `%${item.dupeBrand}%`)
      .ilike('name', `%${item.dupeName}%`)
      .maybeSingle();

    if (existingDupe) {
      console.log(`Dupe already exists: ${item.dupeBrand} - ${item.dupeName}`);
      continue;
    }

    // 3. Insert the new dupe
    const { error: dupeError } = await supabase
      .from('dupes')
      .insert({
        original_id: original.id,
        brand: item.dupeBrand,
        name: item.dupeName,
        price: item.price
      });
    
    if (dupeError) {
      console.error(`Error inserting dupe ${item.dupeName}:`, dupeError.message);
    } else {
      console.log(`✅ Added Dupe: ${item.dupeBrand} ${item.dupeName} (matches ${item.originalName})`);
    }
  }
}

run();
