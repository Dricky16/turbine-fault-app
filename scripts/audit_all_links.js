import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUrl(url) {
  if (!url) return { status: 'null', ok: false };
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    return { status: res.status, ok: res.ok || res.status === 403 }; // 403 on Notino is Cloudflare bot protection
  } catch (e) {
    return { status: 'error', error: e.message, ok: false };
  }
}

async function runAudit() {
  console.log('--- STARTING COMPREHENSIVE LINK AUDIT ---');
  
  // 1. Audit dupes
  const { data: dupes, error: dupeErr } = await supabase.from('dupes').select('*');
  if (dupeErr) throw dupeErr;
  console.log(`Auditing ${dupes.length} dupes...`);

  const issues = [];
  const brandBreakdown = {};

  for (let i = 0; i < dupes.length; i++) {
    const d = dupes[i];
    brandBreakdown[d.brand] = (brandBreakdown[d.brand] || 0) + 1;

    // Check query syntax & obvious anomalies
    if (d.affiliate_link && d.affiliate_link.includes('impression')) {
      issues.push({ id: d.id, name: d.name, brand: d.brand, url: d.affiliate_link, issue: 'Contains "impression" keyword in query' });
    }

    if (d.affiliate_link && d.affiliate_link.includes('notino.ie')) {
      const bLower = (d.brand || '').toLowerCase();
      // Known brands that Notino NEVER stocks
      if (['montagne', 'montagne parfums', 'alexandria', 'alexandria fragrances', 'fine\'ry', 'spectra', 'fragrance world', 'paris corner'].some(bad => bLower.includes(bad))) {
        issues.push({ id: d.id, name: d.name, brand: d.brand, url: d.affiliate_link, issue: `Brand "${d.brand}" is NOT sold on Notino` });
      }
    }
  }

  console.log('\n--- IDENTIFIED ARCHITECTURAL ISSUES IN DUPES ---');
  console.log(`Total issues identified: ${issues.length}`);
  for (const iss of issues) {
    console.log(`[${iss.brand}] ${iss.name}: ${iss.issue} (${iss.url})`);
  }
}

runAudit();
