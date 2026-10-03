import fs from 'fs';

let content = fs.readFileSync('scraper/adapters/zara.js', 'utf8');

// The bug in my scraper:
// if (href.includes('zara.com') && href.includes('.html'))
// matches search.html!

content = content.replace(/if \(href\.includes\('zara\.com'\) && href\.includes\('\.html'\)\) \{/g, "if (href.includes('zara.com') && href.includes('.html') && !href.includes('search.html')) {");

// Also remove the Google Shopping override I added earlier!
content = content.replace(/updateData\.uk_affiliate_link = `https:\/\/www\.google\.com\/search\?tbm=shop&q=\${encodeURIComponent\('Zara ' \+ product\.name \+ ' perfume UK'\)}`;/g, "updateData.uk_affiliate_link = result.url;");
content = content.replace(/updateData\.affiliate_link = `https:\/\/www\.google\.com\/search\?tbm=shop&q=\${encodeURIComponent\('Zara ' \+ product\.name \+ ' perfume Ireland'\)}`;/g, "updateData.affiliate_link = result.url;");

fs.writeFileSync('scraper/adapters/zara.js', content);
console.log("Zara scraper patched to reject search.html and use real product URLs.");
