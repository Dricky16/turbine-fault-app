export default async function scrapeZara(browser, product, supabase, tableName) {
  console.log(`\n🔍 Searching Zara for: ${product.name}`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    const searchUrl = `https://www.zara.com/ie/en/search?searchTerm=${encodeURIComponent(product.name + ' perfume')}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000)); // Wait for JS rendering
    
    const result = await page.evaluate((perfumeName) => {
      // Zara's DOM is tricky. Let's look for product elements
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const text = link.innerText || "";
        const href = link.href || "";
        
        // Zara product URLs usually have -p[numbers].html
        if (href.includes('-p') && href.includes('.html')) {
          if (text.toLowerCase().includes(perfumeName.toLowerCase().split(' ')[0])) {
            // Find price nearby. Usually in a span with class containing 'price'
            const priceText = document.body.innerText.match(/([\d\.]+)\s*EUR/);
            return {
              url: href,
              price: priceText ? parseFloat(priceText[1]) : 22.95 // Fallback Zara price
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
