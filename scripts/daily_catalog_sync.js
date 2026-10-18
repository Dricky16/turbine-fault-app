import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getDupeLinks(brand, name) {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').trim();
  const cleanName = n.replace(new RegExp('^' + b + '\\s+', 'i'), '').trim();
  const searchQuery = cleanName.toLowerCase().includes(b) ? cleanName : `${brand} ${cleanName}`;
  const query = encodeURIComponent(searchQuery);

  if (b.includes('zara')) {
    return {
      ie: `https://www.zara.com/ie/en/search?searchTerm=${encodeURIComponent(cleanName)}`,
      uk: `https://www.zara.com/uk/en/search?searchTerm=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('marks & spencer') || b.includes('m&s')) {
    return {
      ie: `https://www.marksandspencer.com/ie/search?q=${encodeURIComponent(cleanName + ' perfume')}`,
      uk: `https://www.marksandspencer.com/search?q=${encodeURIComponent(cleanName + ' perfume')}`
    };
  }
  if (b.includes('aldi') || b.includes('lidl')) {
    return {
      ie: `https://www.google.com/search?q=${encodeURIComponent('Buy ' + brand + ' ' + cleanName + ' perfume Ireland')}`,
      uk: `https://www.google.com/search?q=${encodeURIComponent('Buy ' + brand + ' ' + cleanName + ' perfume UK')}`
    };
  }
  if (b.includes('dossier')) {
    return {
      ie: `https://dossier.co/search?q=${encodeURIComponent(cleanName)}`,
      uk: `https://dossier.co/search?q=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('superdrug')) {
    return {
      ie: `https://www.superdrug.com/search?q=${encodeURIComponent(cleanName)}`,
      uk: `https://www.superdrug.com/search?q=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('jenny glow')) {
    return {
      ie: `https://www.notino.ie/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`,
      uk: `https://www.notino.co.uk/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`
    };
  }
  return {
    ie: `https://www.notino.ie/search/?exps=${query}`,
    uk: `https://www.notino.co.uk/search/?exps=${query}`
  };
}

async function runDailySync() {
  console.log(`[${new Date().toISOString()}] Starting daily catalog synchronization...`);

  // 1. Audit and clean up any placeholder or broken dupes
  const { error: delErr } = await supabase.from('dupes').delete().eq('name', 'NONE');
  if (!delErr) console.log('Cleaned placeholder records.');

  // 2. Check for perfumes missing links
  const { data: missingPerfumes } = await supabase.from('perfumes').select('id, name, brand').is('affiliate_link', null);
  if (missingPerfumes && missingPerfumes.length > 0) {
    console.log(`Found ${missingPerfumes.length} perfumes missing affiliate links. Updating...`);
    for (const p of missingPerfumes) {
      const q = encodeURIComponent(`${p.brand} ${p.name}`);
      await supabase.from('perfumes').update({
        affiliate_link: `https://www.brownthomas.com/search/?q=${q}`,
        uk_affiliate_link: `https://www.selfridges.com/GB/en/cat/?freeText=${q}`
      }).eq('id', p.id);
    }
  }

  // 3. Check for dupes missing links or with outdated paths
  const { data: dupes } = await supabase.from('dupes').select('*');
  let fixedCount = 0;

  for (const d of dupes) {
    const isOutdated = !d.affiliate_link ||
      d.affiliate_link.includes('search.html') ||
      d.affiliate_link.includes('p-16220067') ||
      d.affiliate_link.includes('p-16070889');

    if (isOutdated || !d.uk_affiliate_link) {
      const generated = getDupeLinks(d.brand, d.name);
      await supabase.from('dupes').update({
        affiliate_link: d.affiliate_link && !isOutdated ? d.affiliate_link : generated.ie,
        uk_affiliate_link: d.uk_affiliate_link ? d.uk_affiliate_link : generated.uk
      }).eq('id', d.id);
      fixedCount++;
    }
  }

  // 4. Summary metrics
  const { count: totalPerfumes } = await supabase.from('perfumes').select('*', { count: 'exact', head: true });
  const { count: totalDupes } = await supabase.from('dupes').select('*', { count: 'exact', head: true });

  console.log(`[${new Date().toISOString()}] Daily catalog sync complete!`);
  console.log(`  - Total active perfumes: ${totalPerfumes}`);
  console.log(`  - Total active dupes: ${totalDupes}`);
  console.log(`  - Links updated / refreshed: ${fixedCount}`);
}

runDailySync().catch(console.error);
