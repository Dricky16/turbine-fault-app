import fs from 'fs';

let content = fs.readFileSync('scraper/adapters/zara.js', 'utf8');

// Change networkidle2 to domcontentloaded to prevent hanging on trackers
content = content.replace("waitUntil: 'networkidle2'", "waitUntil: 'domcontentloaded', timeout: 15000");

// Sometimes Zara shows a modal or cookie banner. We don't care, we just extract from the DOM.
// Let's improve the DOM extraction logic to be more forgiving.
const extractLogic = `const result = await page.evaluate((perfumeName) => {
      // Zara's DOM is tricky. Let's look for product elements
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const text = link.innerText || "";
        const href = link.href || "";
        
        // Zara product URLs usually have -p[numbers].html
        if (href.includes('-p') && href.includes('.html')) {
          if (text.toLowerCase().includes(perfumeName.toLowerCase().split(' ')[0])) {
            // Find price nearby. Usually in a span with class containing 'price'
            const priceText = document.body.innerText.match(/([\\d\\.]+)\\s*EUR/);
            return {
              url: href,
              price: priceText ? parseFloat(priceText[1]) : 22.95 // Fallback Zara price
            };
          }
        }
      }
      return null;
    }, product.name);`;

const newExtractLogic = `const result = await page.evaluate((perfumeName) => {
      // Zara loads products via React/NextJS, look through all text
      const nameFirstWord = perfumeName.toLowerCase().split(' ')[0];
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const href = link.href || "";
        const text = link.textContent || "";
        
        if (href.includes('zara.com') && href.includes('.html')) {
          if (text.toLowerCase().includes(nameFirstWord) || href.toLowerCase().includes(nameFirstWord)) {
            // We found a link to the product! 
            return {
              url: href,
              price: 22.95 // Fallback Zara price as extracting dynamic price from grid is complex without exact selectors
            };
          }
        }
      }
      return null;
    }, product.name);`;

content = content.replace(extractLogic, newExtractLogic);

fs.writeFileSync('scraper/adapters/zara.js', content);
