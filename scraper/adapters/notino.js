export default async function scrapeNotino(browser, product, supabase, tableName, region = 'IE') {
  console.log(\`\\n🔍 Searching Notino (\${region}) for: \${product.brand} \${product.name}\`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    let cleanName = product.name;
    if (cleanName.toLowerCase().startsWith(product.brand.toLowerCase())) {
      cleanName = cleanName.substring(product.brand.length).trim();
    }
    const searchTerm = \`\${product.brand} \${cleanName}\`;
    
    const domain = region === 'UK' ? 'co.uk' : 'ie';
    const searchUrl = \`https://www.notino.\${domain}/search/?q=\${encodeURIComponent(searchTerm)}\`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const result = await page.evaluate((brandName, region) => {
      const links = Array.from(document.querySelectorAll('a'));
      const currencySymbol = region === 'UK' ? '£' : '€';
      
      for (const link of links) {
        const text = link.innerText || "";
        if (text.toLowerCase().includes(brandName.toLowerCase()) && text.includes(currencySymbol)) {
           const regex = region === 'UK' ? /£([\\d\\.]+)/ : /([\\d\\.]+)\\n*€/;
           const priceMatch = text.match(regex);
           
           // Try to find image
           let imgUrl = null;
           const img = link.querySelector('img');
           if (img) {
             imgUrl = img.src;
           }
           
           if (priceMatch) {
             return {
               url: link.href,
               price: parseFloat(priceMatch[1]),
               img: imgUrl
             };
           }
        }
      }
      return null;
    }, product.brand, region);

    if (result && result.url) {
      console.log(\`✅ Found! URL: \${result.url} | Price: \${region === 'UK' ? '£' : '€'}\${result.price}\`);
      
      const updateData = {};
      if (region === 'UK') {
        updateData.uk_affiliate_link = result.url;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = result.url;
        updateData.price = result.price;
      }
      
      // Update image if we found a high quality one
      if (result.img && result.img.includes('notinoimg.com')) {
        updateData.image_url = result.img;
        console.log(\`   📸 Extracted Image: \${result.img.substring(0, 50)}...\`);
      }
      
      await supabase.from(tableName).update(updateData).eq('id', product.id);
    } else {
      console.log(\`❌ Could not find exact match.\`);
    }
  } catch (err) {
    console.error(\`Error on Notino page:\`, err.message);
  } finally {
    await page.close();
  }
}
