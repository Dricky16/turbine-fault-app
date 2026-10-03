import fs from 'fs';
let content = fs.readFileSync('scraper/adapters/zara.js', 'utf8');

content = content.replace(/updateData\.uk_affiliate_link = result\.url;/g, "updateData.uk_affiliate_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + product.name + ' perfume UK')}`;");
content = content.replace(/updateData\.affiliate_link = result\.url;/g, "updateData.affiliate_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + product.name + ' perfume Ireland')}`;");

fs.writeFileSync('scraper/adapters/zara.js', content);
