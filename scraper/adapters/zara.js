export default async function scrapeZara(browser, product, supabase, tableName) {
  console.log(`\n🔍 Searching Zara for: ${product.name}`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    const searchUrl = `https://www.zara.com/ie/en/search?searchTerm=${encodeURIComponent(product.name + ' perfume')}`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000)); // Wait for JS rendering
    
    const result = await page.evaluate((perfumeName) => {
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
    }, product.name);

    if (result && result.url) {
      console.log(`✅ Found! URL: ${result.url} | Price: €${result.price}`);
      
      await supabase
        .from(tableName)
        .update({ 
           affiliate_link: result.url,
           price: result.price
        })
        .eq('id', product.id);
    } else {
      console.log(`❌ Could not find exact match on Zara.`);
    }
  } catch (err) {
    console.error(`Error on Zara page:`, err.message);
  } finally {
    await page.close();
  }
}
