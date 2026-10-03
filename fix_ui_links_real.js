import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  /href=\{original\.affiliate_link\}/g, 
  "href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || `https://www.google.com/search?q=${encodeURIComponent('Buy ' + original.brand + ' ' + original.name + ' perfume ' + (region === 'UK' ? 'UK' : 'Ireland'))}`}"
);

content = content.replace(
  /href=\{dupe\.affiliate_link \|\| "#"\}/g, 
  "href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || `https://www.google.com/search?q=${encodeURIComponent('Buy ' + dupe.brand + ' ' + dupe.name + ' perfume ' + (region === 'UK' ? 'UK' : 'Ireland'))}`}"
);

fs.writeFileSync('src/App.jsx', content);
