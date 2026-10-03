import fs from 'fs';
let content = fs.readFileSync('scraper/adapters/notino.js', 'utf8');

const target = `const text = link.innerText || "";
        if (text.toLowerCase().includes(brandName.toLowerCase()) && text.includes(currencySymbol)) {`;
const rep = `const text = link.innerText || "";
        const lowerText = text.toLowerCase();
        
        // Skip travel sizes, mini sprays, and small variations unless they are the only thing
        const isTravelSize = lowerText.includes('10 ml') || lowerText.includes('10ml') || lowerText.includes('15 ml') || lowerText.includes('15ml') || lowerText.includes('travel') || lowerText.includes('discovery') || lowerText.includes('mini') || lowerText.includes('body lotion') || lowerText.includes('hand cream');
        
        if (lowerText.includes(brandName.toLowerCase()) && text.includes(currencySymbol) && !isTravelSize) {`;

content = content.replace(target, rep);
fs.writeFileSync('scraper/adapters/notino.js', content);
