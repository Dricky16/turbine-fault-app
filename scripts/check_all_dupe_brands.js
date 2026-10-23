import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAllBrands() {
  const { data: dupes, error } = await supabase.from('dupes').select('brand, name, affiliate_link');
  if (error) {
    console.error(error);
    return;
  }
  const summary = {};
  for (const d of dupes) {
    const b = d.brand || '(unknown)';
    if (!summary[b]) {
      summary[b] = { count: 0, sampleLinks: [] };
    }
    summary[b].count++;
    if (summary[b].sampleLinks.length < 2) {
      summary[b].sampleLinks.push(d.affiliate_link);
    }
  }

  console.log('All dupe brands in database:');
  const sorted = Object.entries(summary).sort((a,b) => b[1].count - a[1].count);
  for (const [brand, info] of sorted) {
    console.log(`- ${brand} (${info.count} items)`);
    console.log(`    Sample: ${info.sampleLinks[0]}`);
  }
}

checkAllBrands();
