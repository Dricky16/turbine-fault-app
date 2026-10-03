import fs from 'fs';

let content = fs.readFileSync('scraper/index.js', 'utf8');

const importTarget = `import scrapeZara from './adapters/zara.js';`;
const importRep = `import scrapeZara from './adapters/zara.js';\nimport scrapeSuperdrug from './adapters/superdrug.js';\nimport scrapeNext from './adapters/next.js';\nimport scrapeMS from './adapters/marks_and_spencer.js';`;
content = content.replace(importTarget, importRep);

const routingTarget = `      if (brand.includes("zara")) {
        await scrapeZara(browser, dupe, supabase, 'dupes');
      } 
      else if (brand.includes("lattafa") || brand.includes("armaf") || brand.includes("afnan")) {`;
const routingRep = `      if (brand.includes("zara")) {
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
      else if (brand.includes("lattafa") || brand.includes("armaf") || brand.includes("afnan")) {`;
content = content.replace(routingTarget, routingRep);

fs.writeFileSync('scraper/index.js', content);
