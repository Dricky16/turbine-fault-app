import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update getFallbackUrl to return null instead of Notino, and add more brands to Brown Thomas list
content = content.replace(
  /return \`https:\/\/www\.notino\.\$\{region === 'UK' \? 'co\.uk' : 'ie'\}\/search\/\?q=\$\{query\}\`;/g,
  'return null;'
);

// Add more premium brands to the Brown Thomas / Selfridges fallback list
content = content.replace(
  /if \(b\.includes\('ex nihilo'\) \|\| b\.includes\('creed'\) \|\| b\.includes\('tom ford'\) \|\| b\.includes\('xerjoff'\)\) \{/,
  "if (b.includes('ex nihilo') || b.includes('creed') || b.includes('tom ford') || b.includes('xerjoff') || b.includes('maison margiela') || b.includes('byredo') || b.includes('le labo') || b.includes('dior') || b.includes('chanel') || b.includes('ysl') || b.includes('giorgio armani') || b.includes('paco rabanne') || b.includes('mugler') || b.includes('carolina herrera') || b.includes('marc jacobs') || b.includes('jo malone') || b.includes('roja') || b.includes('parfums de marly')) {"
);

fs.writeFileSync('src/App.jsx', content);
console.log('Patched fallbacks.');
