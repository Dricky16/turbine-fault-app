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

async function dedupeTable(tableName) {
  console.log(`\n--- Deduplicating ${tableName} ---`);
  
  const { data: rows, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }

  const duplicates = {};
  
  rows.forEach(row => {
    // Normalize string to match accurately (lowercase, trimmed, remove extra spaces)
    const key = `${row.brand.toLowerCase().trim()} - ${row.name.toLowerCase().trim()}`.replace(/\s+/g, ' ');
    if (!duplicates[key]) {
      duplicates[key] = [];
    }
    duplicates[key].push(row);
  });

  let totalDeleted = 0;

  for (const [key, items] of Object.entries(duplicates)) {
    if (items.length > 1) {
      console.log(`Found ${items.length} duplicates for: ${key}`);
      
      // Sort items by quality: 
      // 1. Has affiliate_link
      // 2. Has image_url
      // 3. Has price
      items.sort((a, b) => {
        let scoreA = (a.affiliate_link ? 3 : 0) + (a.image_url ? 2 : 0) + (a.price ? 1 : 0);
        let scoreB = (b.affiliate_link ? 3 : 0) + (b.image_url ? 2 : 0) + (b.price ? 1 : 0);
        return scoreB - scoreA;
      });

      const bestItem = items[0];
      const itemsToDelete = items.slice(1);

      console.log(`  Keeping ID: ${bestItem.id} (Price: ${bestItem.price})`);
      
      for (const toDelete of itemsToDelete) {
        console.log(`  Deleting ID: ${toDelete.id}`);
        // If this is the perfumes table, we need to re-link dupes to the bestItem.id before deleting
        if (tableName === 'perfumes') {
           const { error: updateError } = await supabase
              .from('dupes')
              .update({ original_id: bestItem.id })
              .eq('original_id', toDelete.id);
           if (updateError) console.error(`    Error re-linking dupes:`, updateError);
        }
        
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', toDelete.id);
          
        if (deleteError) {
           console.error(`    Error deleting:`, deleteError);
        } else {
           totalDeleted++;
        }
      }
    }
  }
  
  console.log(`\nFinished deduplicating ${tableName}. Total deleted: ${totalDeleted}`);
}

async function run() {
  await dedupeTable('perfumes');
  await dedupeTable('dupes');
}

run();
