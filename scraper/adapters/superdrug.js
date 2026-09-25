export default async function scrapeSuperdrug(browser, product, supabase, tableName) {
  console.log(`\n🔍 Searching Superdrug for: ${product.name}`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    const searchUrl = `https://www.superdrug.com/search?q=${encodeURIComponent(product.name)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    const result = await page.evaluate((perfumeName) => {
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const text = link.innerText || "";
        const href = link.href || "";
        
        // Superdrug products often have /p/ in the URL
        if (href.includes('/p/')) {
          if (text.toLowerCase().includes(perfumeName.toLowerCase().split(' ')[0])) {
            const priceText = document.body.innerText.match(/£([\d\.]+)|€([\d\.]+)/);
            return {
              url: href,
              price: priceText ? parseFloat(priceText[1] || priceText[2]) : 14.99
            };
          }
        }
      }
      return null;
    }, product.name);

    if (result && result.url) {
      console.log(`✅ Found! URL: ${result.url} | Price: ${result.price}`);
      await supabase.from(tableName).update({ affiliate_link: result.url, price: result.price }).eq('id', product.id);
    } else {
      console.log(`❌ Could not find exact match on Superdrug.`);
    }
  } catch (err) {
    console.error(`Error on Superdrug page:`, err.message);
  } finally {
    await page.close();
  }
}
