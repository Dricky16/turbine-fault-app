export default async function scrapeNotino(browser, product, supabase, tableName) {
  console.log(`\n🔍 Searching Notino for: ${product.brand} ${product.name}`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Fix duplicate brand names (e.g., "Tom Ford Tom Ford Tobacco Vanille")
    let cleanName = product.name;
    if (cleanName.toLowerCase().startsWith(product.brand.toLowerCase())) {
      cleanName = cleanName.substring(product.brand.length).trim();
    }
    const searchTerm = `${product.brand} ${cleanName}`;
    const searchUrl = `https://www.notino.ie/search/?q=${encodeURIComponent(searchTerm)}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); // Wait for JS rendering
    
    const result = await page.evaluate((brandName) => {
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const text = link.innerText || "";
        // Look for the brand name and a euro symbol
        if (text.toLowerCase().includes(brandName.toLowerCase()) && text.includes('€')) {
           const priceMatch = text.match(/([\d\.]+)\n*€/);
           if (priceMatch) {
             return {
               url: link.href,
               price: parseFloat(priceMatch[1])
             };
           }
        }
      }
      return null;
    }, product.brand);

    if (result && result.url) {
      console.log(`✅ Found! URL: ${result.url} | Price: €${result.price}`);
      
      // Save to database
      await supabase
        .from(tableName)
        .update({ 
           affiliate_link: result.url,
           price: result.price
        })
        .eq('id', product.id);
    } else {
      console.log(`❌ Could not find exact match.`);
    }
  } catch (err) {
    console.error(`Error on Notino page:`, err.message);
  } finally {
    await page.close();
  }
}
