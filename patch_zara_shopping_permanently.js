import fs from 'fs';

let content = fs.readFileSync('scraper/adapters/zara.js', 'utf8');

// Replace the updateData.affiliate_link logic
const target = `      if (region === 'UK') {
        updateData.uk_affiliate_link = result.url;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = result.url;
        updateData.price = result.price;
      }`;
      
const rep = `      if (region === 'UK') {
        updateData.uk_affiliate_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + product.name + ' perfume UK')}`;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent('Zara ' + product.name + ' perfume Ireland')}`;
        updateData.price = result.price;
      }`;
      
content = content.replace(target, rep);
fs.writeFileSync('scraper/adapters/zara.js', content);
