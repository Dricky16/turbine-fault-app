import fs from 'fs';

let content = fs.readFileSync('scraper/adapters/notino.js', 'utf8');

const target = `const searchTerm = \`\${product.brand} \${product.name}\`;`;
const rep = `// Fix duplicate brand names (e.g., "Tom Ford Tom Ford Tobacco Vanille")
    let cleanName = product.name;
    if (cleanName.toLowerCase().startsWith(product.brand.toLowerCase())) {
      cleanName = cleanName.substring(product.brand.length).trim();
    }
    const searchTerm = \`\${product.brand} \${cleanName}\`;`;

content = content.replace(target, rep);
fs.writeFileSync('scraper/adapters/notino.js', content);
