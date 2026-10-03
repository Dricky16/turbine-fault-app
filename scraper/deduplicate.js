import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Must use service role to update/delete
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: perfumes } = await supabase.from('perfumes').select('*');
  const { data: dupes } = await supabase.from('dupes').select('*');
  
  const suspicious = [];
  
  // Find pairs
  for (let i=0; i<perfumes.length; i++) {
    for (let j=i+1; j<perfumes.length; j++) {
      const p1 = perfumes[i];
      const p2 = perfumes[j];
      
      if (p1.brand === p2.brand) {
        if (p1.name.includes(p2.name) || p2.name.includes(p1.name)) {
          // Baccarat Rouge has 3! Skip if already in suspicious
          if (!suspicious.some(s => (s[0].id === p1.id && s[1].id === p2.id) || (s[0].id === p2.id && s[1].id === p1.id))) {
            suspicious.push([p1, p2]);
          }
        }
      }
    }
  }

  // To avoid dealing with 3-way duplicates in a messy loop, let's group them by base name
  // Actually, Baccarat Rouge is the only 3-way. Let's just hardcode the baccarat rouge fix first, then do the rest.
  
  let mergedCount = 0;
  
  for (const pair of suspicious) {
    let p1 = pair[0];
    let p2 = pair[1];
    
    // Check if one of them is already deleted in a previous loop
    const { data: check1 } = await supabase.from('perfumes').select('id').eq('id', p1.id).maybeSingle();
    const { data: check2 } = await supabase.from('perfumes').select('id').eq('id', p2.id).maybeSingle();
    if (!check1 || !check2) continue;
    
    console.log(`\nEvaluating: ${p1.brand}`);
    console.log(`1. ${p1.name} (Price: ${p1.price}, Img: ${!!p1.image_url})`);
    console.log(`2. ${p2.name} (Price: ${p2.price}, Img: ${!!p2.image_url})`);
    
    // Choose keeper
    let keeper = p1;
    let loser = p2;
    
    // Logic: Prefer the one with a non-null price.
    if (p1.price === null && p2.price !== null) {
      keeper = p2; loser = p1;
    } else if (p2.price === null && p1.price !== null) {
      keeper = p1; loser = p2;
    } 
    // If both have price (or both null), prefer the one with an image
    else if (!p1.image_url && p2.image_url) {
      keeper = p2; loser = p1;
    } else if (!p2.image_url && p1.image_url) {
      keeper = p1; loser = p2;
    }
    // Otherwise prefer the shorter name (e.g. "Aventus" over "Creed Aventus")
    else if (p2.name.length < p1.name.length) {
      keeper = p2; loser = p1;
    }
    
    console.log(`=> Keeping: ${keeper.name} | Deleting: ${loser.name}`);
    
    // 1. Reassign dupes from loser to keeper
    const { data: loserDupes } = await supabase.from('dupes').select('id').eq('original_id', loser.id);
    if (loserDupes && loserDupes.length > 0) {
      console.log(`   Reassigning ${loserDupes.length} dupes...`);
      await supabase.from('dupes').update({ original_id: keeper.id }).eq('original_id', loser.id);
    }
    
    // 2. Reassign favorites from loser to keeper (if any exist yet)
    const { data: loserFavs } = await supabase.from('favorites').select('id').eq('perfume_id', loser.id);
    if (loserFavs && loserFavs.length > 0) {
      await supabase.from('favorites').update({ perfume_id: keeper.id }).eq('perfume_id', loser.id);
    }
    
    // 3. Delete loser
    await supabase.from('perfumes').delete().eq('id', loser.id);
    mergedCount++;
  }
  
  console.log(`\nSuccessfully merged ${mergedCount} duplicates!`);
}
run();
