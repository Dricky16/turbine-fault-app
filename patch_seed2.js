import fs from 'fs';

let content = fs.readFileSync('generate_seed2.js', 'utf8');

content = content.replace(/description: `A masterclass in perfumery.*`,/g, '');
content = content.replace(/description: `An incredibly close match.*`,/g, '');

fs.writeFileSync('generate_seed2.js', content);
