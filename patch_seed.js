import fs from 'fs';

let content = fs.readFileSync('generate_seed.js', 'utf8');

const targetPerfume = `    top_notes: data[3],
    heart_notes: data[4],
    base_notes: data[5],
    description: \`A masterclass in perfumery, \${data[1]} by \${data[0]} opens with \${data[3]}. The heart reveals \${data[4]}, settling into a luxurious base of \${data[5]}.\`,`;

const repPerfume = `    notes: \`\${data[3]} | \${data[4]} | \${data[5]}\`,`;

content = content.replace(targetPerfume, repPerfume);

const targetDupe = `    description: \`An incredibly close match to \${data[1]}, capturing the essence of the original at a fraction of the price.\`,`;
const repDupe = `    notes: \`Inspired by \${data[1]}\`,`;

content = content.replace(targetDupe, repDupe);

fs.writeFileSync('generate_seed.js', content);
