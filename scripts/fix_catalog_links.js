import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
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
  if (b.includes('oakcha')) {
    return {
      ie: `https://www.oakcha.com/search?q=${encodeURIComponent(cleanName)}`,
      uk: `https://www.oakcha.com/search?q=${encodeURIComponent(cleanName)}`
    };
  }
  return {
    ie: `https://www.notino.ie/search/?exps=${query}`,
    uk: `https://www.notino.co.uk/search/?exps=${query}`
  };
}

async function run() {
  console.log('--- Step 1: Delete bogus dupe ---');
  const { error: delErr } = await supabase.from('dupes').delete().eq('name', 'NONE').eq('brand', 'NONE');
  if (delErr) console.warn('Could not delete NONE dupe:', delErr.message);
  else console.log('Deleted placeholder NONE dupe successfully');

  console.log('\n--- Step 2: Fix 22 original flagship perfumes missing links ---');
  const { data: missingPerfumes } = await supabase.from('perfumes').select('*').is('affiliate_link', null);
  if (missingPerfumes && missingPerfumes.length > 0) {
    console.log(`Updating ${missingPerfumes.length} original perfumes...`);
    for (const p of missingPerfumes) {
      const query = encodeURIComponent(`${p.brand} ${p.name}`);
      const ieLink = `https://www.brownthomas.com/search/?q=${query}`;
      const ukLink = `https://www.selfridges.com/GB/en/cat/?freeText=${query}`;
      await supabase.from('perfumes').update({
        affiliate_link: ieLink,
        uk_affiliate_link: ukLink
      }).eq('id', p.id);
    }
    console.log('Updated all missing original perfumes with Brown Thomas / Selfridges links.');
  }

  console.log('\n--- Step 3: Fix all dupes links ---');
  const { data: dupes } = await supabase.from('dupes').select('*');
  console.log(`Fetched ${dupes.length} dupes from DB`);

  let updatedCount = 0;
  for (const d of dupes) {
    const isMismatched = d.affiliate_link && (
      d.affiliate_link.includes('p-16220067') || 
      d.affiliate_link.includes('p-16070889') || 
      d.affiliate_link.includes('p-16275307') ||
      d.affiliate_link.includes('brownthomas.com/search?q=1981X') ||
      d.affiliate_link === 'https://www.lidl.ie/' ||
      d.affiliate_link === 'https://www.aldi.ie/c/specialbuys/beauty' ||
      d.affiliate_link.includes('search.html')
    );

    if (!d.affiliate_link || isMismatched || !d.uk_affiliate_link) {
      const generated = getDupeLinks(d.brand, d.name);
      const updates = {};
      
      if (!d.affiliate_link || isMismatched) {
        updates.affiliate_link = generated.ie;
      }
      if (!d.uk_affiliate_link || isMismatched) {
        updates.uk_affiliate_link = generated.uk;
      }

      const { error: upErr } = await supabase.from('dupes').update(updates).eq('id', d.id);
      if (upErr) {
        console.error(`Error updating dupe ${d.id} (${d.brand} ${d.name}):`, upErr.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} dupes with working store links!`);
}

run().catch(console.error);
