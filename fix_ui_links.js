import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix Dupe links
const targetDupeLink = `href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || '#'}`;
const repDupeLink = `href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || \`https://www.google.com/search?q=\${encodeURIComponent('Buy ' + dupe.brand + ' ' + dupe.name + ' perfume ' + (region === 'UK' ? 'UK' : 'Ireland'))}\`}`;
content = content.replace(targetDupeLink, repDupeLink);

// Fix Original links
const targetOrigLink = `href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || '#'}`;
const repOrigLink = `href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || \`https://www.google.com/search?q=\${encodeURIComponent('Buy ' + original.brand + ' ' + original.name + ' perfume ' + (region === 'UK' ? 'UK' : 'Ireland'))}\`}`;
// Wait, origLink might not be exactly that. Let's do a regex or just replace `#` if it exists.
content = content.replace(/href=\{\(region === 'UK' \? original\.uk_affiliate_link : original\.affiliate_link\) \|\| original\.affiliate_link \|\| '#'\}/g, repOrigLink);

fs.writeFileSync('src/App.jsx', content);
