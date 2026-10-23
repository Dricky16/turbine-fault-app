import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function runGlobalFix() {
  console.log('--- EXECUTING GLOBAL DUPE LINK AUDIT & REPAIR ---');

  const { data: dupes, error } = await supabase.from('dupes').select('*');
  if (error) throw error;
  console.log(`Auditing all ${dupes.length} dupes...`);

  let updatedCount = 0;

  for (const d of dupes) {
    const brand = (d.brand || '').trim();
    const bLower = brand.toLowerCase();
    let name = (d.name || '').trim();

    // 1. Fix typos
    if (name.includes('Supermacy')) {
      name = name.replace(/Supermacy/g, 'Supremacy');
      await supabase.from('dupes').update({ name }).eq('id', d.id);
    }

    // 2. Fix Alexandria Fragrances
    if (bLower.includes('alexandria')) {
      const clean = name.replace(/^alexandria\s+fragrances?\s+/i, '').trim();
      const ieUrl = `https://alexandriauk.com/search?type=product&q=${encodeURIComponent(clean)}`;
      const ukUrl = `https://alexandriauk.com/search?type=product&q=${encodeURIComponent(clean)}`;
      await supabase.from('dupes').update({ affiliate_link: ieUrl, uk_affiliate_link: ukUrl }).eq('id', d.id);
      updatedCount++;
      continue;
    }

    // 3. Fix Montagne Parfums
    if (bLower.includes('montagne')) {
      const clean = name.replace(/^montagne\s+parfums?\s+/i, '').trim();
      const url = `https://www.montagneparfums.com/search?q=${encodeURIComponent(clean)}`;
      await supabase.from('dupes').update({ affiliate_link: url, uk_affiliate_link: url }).eq('id', d.id);
      updatedCount++;
      continue;
    }

    // 4. Fix Fine'ry
    if (bLower.includes("fine'ry") || bLower.includes('finery')) {
      const clean = name.replace(/^fine'?ry\s+/i, '').trim();
      const url = `https://www.target.com/s?searchTerm=Finery+${encodeURIComponent(clean)}`;
      await supabase.from('dupes').update({ affiliate_link: url, uk_affiliate_link: url }).eq('id', d.id);
      updatedCount++;
      continue;
    }

    // 5. Fix Spectra
    if (bLower.includes('spectra')) {
      const ieUrl = `https://soghaat.co.uk/search?type=product&q=${encodeURIComponent('Spectra ' + name)}`;
      const ukUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent('Spectra ' + name)}`;
      await supabase.from('dupes').update({ affiliate_link: ieUrl, uk_affiliate_link: ukUrl }).eq('id', d.id);
      updatedCount++;
      continue;
    }

    // 6. Fix Middle Eastern clone houses not sold on Notino:
    // Maison Alhambra, Fragrance World, Paris Corner
    if (bLower.includes('maison alhambra') || bLower.includes('fragrance world') || bLower.includes('paris corner')) {
      // Clean query string (remove "impression" if present)
      const cleanName = name.replace(/\s+impression$/i, '').trim();
      const searchQuery = `${brand} ${cleanName}`;

      const ieUrl = `https://soghaat.co.uk/search?type=product&q=${encodeURIComponent(searchQuery)}`;
      const ukUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent(searchQuery)}`;

      await supabase.from('dupes').update({
        name: cleanName,
        affiliate_link: ieUrl,
        uk_affiliate_link: ukUrl
      }).eq('id', d.id);
      updatedCount++;
      continue;
    }

    // 7. Sanitize any remaining Notino links that have "impression" in them
    if (d.affiliate_link && d.affiliate_link.includes('notino.ie') && d.affiliate_link.includes('impression')) {
      const cleanName = name.replace(/\s+impression$/i, '').trim();
      const searchQuery = `${brand} ${cleanName}`;
      const ieUrl = `https://www.notino.ie/search/?exps=${encodeURIComponent(searchQuery)}`;
      const ukUrl = `https://www.notino.co.uk/search/?exps=${encodeURIComponent(searchQuery)}`;
      await supabase.from('dupes').update({
        name: cleanName,
        affiliate_link: ieUrl,
        uk_affiliate_link: ukUrl
      }).eq('id', d.id);
      updatedCount++;
    }
  }

  console.log(`Successfully audited and updated ${updatedCount} dupes!`);
}

runGlobalFix();
