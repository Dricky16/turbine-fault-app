import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: perfumes } = await supabase.from('perfumes').select('*');
  
  const suspicious = [];
  
  for (let i=0; i<perfumes.length; i++) {
    for (let j=i+1; j<perfumes.length; j++) {
      const p1 = perfumes[i];
      const p2 = perfumes[j];
      
      if (p1.brand === p2.brand) {
        if (p1.name.includes(p2.name) || p2.name.includes(p1.name)) {
          if (!suspicious.some(s => (s[0].id === p1.id && s[1].id === p2.id) || (s[0].id === p2.id && s[1].id === p1.id))) {
            suspicious.push([p1, p2]);
          }
        }
      }
    }
  }
  
  let sql = `-- Deduplication Script generated automatically\n\n`;
  const deletedIds = new Set();
  
  for (const pair of suspicious) {
    let p1 = pair[0];
    let p2 = pair[1];
    
    if (deletedIds.has(p1.id) || deletedIds.has(p2.id)) continue;
    
    let keeper = p1;
    let loser = p2;
    
    if (p1.price === null && p2.price !== null) {
      keeper = p2; loser = p1;
    } else if (p2.price === null && p1.price !== null) {
      keeper = p1; loser = p2;
    } else if (!p1.image_url && p2.image_url) {
      keeper = p2; loser = p1;
    } else if (!p2.image_url && p1.image_url) {
      keeper = p1; loser = p2;
    } else if (p2.name.length < p1.name.length) {
      keeper = p2; loser = p1;
    }
    
    sql += `-- Merging "${loser.name}" into "${keeper.name}"\n`;
    sql += `UPDATE dupes SET original_id = '${keeper.id}' WHERE original_id = '${loser.id}';\n`;
    sql += `UPDATE favorites SET perfume_id = '${keeper.id}' WHERE perfume_id = '${loser.id}';\n`;
    sql += `DELETE FROM perfumes WHERE id = '${loser.id}';\n\n`;
    
    deletedIds.add(loser.id);
  }
  
  fs.writeFileSync('/Users/conor/.gemini/antigravity/brain/388f9ce8-9347-4f1d-b01d-34068229d72f/artifacts/deduplicate.sql', sql);
  console.log('SQL generated successfully.');
}
run();
