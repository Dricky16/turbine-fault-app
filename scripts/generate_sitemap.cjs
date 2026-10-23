const fs = require('fs');
const path = require('path');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["\x27]|["\x27]$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function generateSitemap() {
  console.log('Fetching perfumes and dupes from Supabase...');
  
  // 1. Fetch all dupes to get which originals have dupes
  const { data: dupes, error: dupeErr } = await supabase.from('dupes').select('original_id');
  if (dupeErr) {
    console.error('Dupe error:', dupeErr);
    process.exit(1);
  }
  
  const origIdsWithDupes = new Set(dupes.map(d => d.original_id));
  
  // 2. Fetch all perfumes
  const { data: perfumes, error: perfErr } = await supabase.from('perfumes').select('id, name, brand, created_at');
  if (perfErr) {
    console.error('Perfume error:', perfErr);
    process.exit(1);
  }
  
  console.log(`Found ${perfumes.length} perfumes, ${origIdsWithDupes.size} have verified dupes.`);
  
  const today = new Date().toISOString().split('T')[0];
  
  const urls = [];
  
  // Homepage
  urls.push(`  <url>
    <loc>https://scentsforcents.ie/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  
  // Originals with dupes (priority 0.8)
  for (const p of perfumes) {
    if (origIdsWithDupes.has(p.id)) {
      urls.push(`  <url>
    <loc>https://scentsforcents.ie/?p=${p.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  }

  // Other original perfumes in the database (priority 0.5)
  for (const p of perfumes) {
    if (!origIdsWithDupes.has(p.id)) {
      urls.push(`  <url>
    <loc>https://scentsforcents.ie/?p=${p.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemapXml, 'utf8');
  console.log(`Successfully generated public/sitemap.xml with ${urls.length} URLs!`);
}

generateSitemap();
