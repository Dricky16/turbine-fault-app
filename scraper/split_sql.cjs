const fs = require('fs');

const sql = fs.readFileSync('/Users/conor/.gemini/antigravity/brain/388f9ce8-9347-4f1d-b01d-34068229d72f/artifacts/deduplicate_perfumes.sql', 'utf8');

// The file is separated by double newlines for each merge block
const blocks = sql.split('\n\n').filter(b => b.trim().length > 0);
// The first block is the comment "-- Deduplication Script generated automatically"
const header = blocks.shift();

// We have 21 blocks total. 21 / 3 = 7 blocks per file.
const part1 = [header, ...blocks.slice(0, 7)].join('\n\n') + '\n';
const part2 = [header, ...blocks.slice(7, 14)].join('\n\n') + '\n';
const part3 = [header, ...blocks.slice(14)].join('\n\n') + '\n';

fs.writeFileSync('part1.sql', part1);
fs.writeFileSync('part2.sql', part2);
fs.writeFileSync('part3.sql', part3);
