const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const fallbackFunc = `
  const getFallbackUrl = (brand, name, region) => {
    const query = encodeURIComponent(brand + ' ' + name);
    const b = brand.toLowerCase();
    
    if (b.includes('zara')) {
      return \`https://www.zara.com/\${region === 'UK' ? 'uk/en' : 'ie/en'}/search.html?searchTerm=\${query}\`;
    }
    if (b.includes('ex nihilo') || b.includes('creed') || b.includes('tom ford')) {
       // Brown Thomas for IE, Selfridges/Harrods for UK (just fallback to Brown Thomas for IE)
       return region === 'UK' 
        ? \`https://www.selfridges.com/GB/en/cat/?freeText=\${query}\`
        : \`https://www.brownthomas.com/search/?q=\${query}\`;
    }
    if (b.includes('aldi') || b.includes('lidl') || b.includes('marks & spencer')) {
      return \`https://www.google.com/search?q=\${encodeURIComponent('Buy ' + brand + ' ' + name + ' perfume ' + region)}\`;
    }
    
    // Default to Notino for designer brands
    return \`https://www.notino.\${region === 'UK' ? 'co.uk' : 'ie'}/search/?q=\${query}\`;
  };
`;

// Insert after state declarations
code = code.replace(/const \[region, setRegion\] = useState\('IE'\); \/\/ 'IE' or 'UK'\n/, "const [region, setRegion] = useState('IE');\n" + fallbackFunc);

// Replace original fallback
code = code.replace(/href=\{\(region === 'UK' \? original\.uk_affiliate_link : original\.affiliate_link\) \|\| original\.affiliate_link \|\| `https:\/\/www\.notino\.\$\{region === 'UK' \? 'co\.uk' : 'ie'\}\/search\/\?q=\$\{encodeURIComponent\(original\.brand \+ ' ' \+ original\.name\)\}`\}/, 
"href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)}");

// Replace dupe fallback
code = code.replace(/href=\{\(region === 'UK' \? dupe\.uk_affiliate_link : dupe\.affiliate_link\) \|\| dupe\.affiliate_link \|\| `https:\/\/www\.notino\.\$\{region === 'UK' \? 'co\.uk' : 'ie'\}\/search\/\?q=\$\{encodeURIComponent\(dupe\.brand \+ ' ' \+ dupe\.name\)\}`\}/, 
"href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}");

fs.writeFileSync('src/App.jsx', code);
