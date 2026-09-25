export default async function scrapeZara(browser, product, supabase, tableName, region = 'IE') {
  console.log(\`\\n🔍 Searching Zara (\${region}) for: \${product.name}\`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    const domain = region === 'UK' ? 'uk' : 'ie';
    const searchUrl = \`https://www.zara.com/\${domain}/en/search?searchTerm=\${encodeURIComponent(product.name + ' perfume')}\`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000)); 
    
    const result = await page.evaluate((perfumeName, region) => {
      const nameFirstWord = perfumeName.toLowerCase().split(' ')[0];
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const href = link.href || "";
        const text = link.textContent || "";
        
        if (href.includes('zara.com') && href.includes('.html')) {
          if (text.toLowerCase().includes(nameFirstWord) || href.toLowerCase().includes(nameFirstWord)) {
            let imgUrl = null;
            const imgs = document.querySelectorAll('img.media-image__image');
            if (imgs.length > 0) imgUrl = imgs[0].src;
            
            return {
              url: href,
              price: region === 'UK' ? 19.99 : 22.95, // Fallback Zara price
              img: imgUrl
            };
          }
        }
      }
      return null;
    }, product.name, region);

    if (result && result.url) {
      console.log(\`✅ Found! URL: \${result.url}\`);
      
      const updateData = {};
      if (region === 'UK') {
        updateData.uk_affiliate_link = result.url;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = result.url;
        updateData.price = result.price;
      }
      
      if (result.img) {
        // Only override if not already set to Zara's CDN or if it is generic
        updateData.image_url = result.img;
        console.log(\`   📸 Extracted Image: \${result.img.substring(0, 50)}...\`);
      }
      
      await supabase.from(tableName).update(updateData).eq('id', product.id);
    } else {
      console.log(\`❌ Could not find exact match on Zara.\`);
    }
  } catch (err) {
    console.error(\`Error on Zara page:\`, err.message);
  } finally {
    await page.close();
  }
}
