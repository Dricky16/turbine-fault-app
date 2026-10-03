import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Reading catalog...");
  const catalog = JSON.parse(fs.readFileSync('catalog_seed2.json', 'utf8'));
  
  console.log(`Ready to insert ${catalog.length} designers and their dupes.`);
  
  for (const item of catalog) {
    const orig = item.original;
    console.log(`Processing Designer: ${orig.brand} ${orig.name}`);
    
    // 1. Insert or get original
    let origId;
    const { data: existing } = await supabase
      .from('perfumes')
      .select('id')
      .ilike('name', orig.name)
      .ilike('brand', orig.brand)
      .single();
      
    if (existing) {
      origId = existing.id;
      console.log(`  -> Original already exists (${origId})`);
    } else {
      const { data: inserted, error } = await supabase
        .from('perfumes')
        .insert([orig])
        .select()
        .single();
        
      if (error) {
        console.error("Error inserting original:", error.message);
        continue;
      }
      origId = inserted.id;
      console.log(`  -> Inserted original (${origId})`);
    }
    
    // 2. Insert dupes
    for (const d of item.dupes) {
      d.original_id = origId;
      
      const { data: existingDupe } = await supabase
        .from('dupes')
        .select('id')
        .ilike('name', d.name)
        .ilike('brand', d.brand)
        .eq('original_id', origId)
        .single();
        
      if (!existingDupe) {
         const { error } = await supabase.from('dupes').insert([d]);
         if (error) {
           console.error("  -> Error inserting dupe:", error.message);
         } else {
           console.log(`  -> Inserted dupe: ${d.brand} ${d.name}`);
         }
      } else {
         console.log(`  -> Dupe already exists: ${d.brand} ${d.name}`);
      }
    }
  }
  console.log("\nDatabase Seed Complete!");
}

run();
