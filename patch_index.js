import fs from 'fs';

let content = fs.readFileSync('scraper/index.js', 'utf8');

const target1 = `  // --- Process Originals (All via Notino) ---
  console.log("\\n--- Scraping Originals (via Notino) ---");
  for (const orig of originals) {
    // Only scrape if it's a designer brand
    try {
      await scrapeNotino(browser, orig, supabase, 'perfumes');
    } catch (err) {
      console.error(\`❌ Error scraping \${orig.name}:\`, err.message);
    }
  }`;

const rep1 = `  // --- Process Originals (All via Notino) ---
  console.log("\\n--- Scraping Originals (via Notino) ---");
  for (const orig of originals) {
    try {
      await scrapeNotino(browser, orig, supabase, 'perfumes', 'IE');
      await scrapeNotino(browser, orig, supabase, 'perfumes', 'UK');
    } catch (err) {
      console.error(\`❌ Error scraping \${orig.name}:\`, err.message);
    }
  }`;
content = content.replace(target1, rep1);

const target2 = `      if (brand.includes("zara")) {
        await scrapeZara(browser, dupe, supabase, 'dupes');
      }
      else if (brand.includes("superdrug")) {
        await scrapeSuperdrug(browser, dupe, supabase, 'dupes');
      }
      else if (brand.includes("next")) {
        await scrapeNext(browser, dupe, supabase, 'dupes');
      }
      else if (brand.includes("marks") || brand.includes("m&s") || brand.includes("spencer")) {
        await scrapeMS(browser, dupe, supabase, 'dupes');
      }
      else if (brand.includes("lattafa") || brand.includes("armaf") || brand.includes("afnan")) {
        // Middle eastern clones usually sold on Notino
        await scrapeNotino(browser, dupe, supabase, 'dupes');
      }`;

const rep2 = `      if (brand.includes("zara")) {
        await scrapeZara(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeZara(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("superdrug")) {
        await scrapeSuperdrug(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeSuperdrug(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("next")) {
        await scrapeNext(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeNext(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("marks") || brand.includes("m&s") || brand.includes("spencer")) {
        await scrapeMS(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeMS(browser, dupe, supabase, 'dupes', 'UK');
      }
      else if (brand.includes("lattafa") || brand.includes("armaf") || brand.includes("afnan") || brand.includes("maison alhambra") || brand.includes("fragrance world")) {
        // Middle eastern clones usually sold on Notino
        await scrapeNotino(browser, dupe, supabase, 'dupes', 'IE');
        await scrapeNotino(browser, dupe, supabase, 'dupes', 'UK');
      }`;
content = content.replace(target2, rep2);

fs.writeFileSync('scraper/index.js', content);
