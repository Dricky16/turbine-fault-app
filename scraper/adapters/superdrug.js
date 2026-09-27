export default async function scrapeSuperdrug(browser, product, supabase, tableName, region = 'IE') {
  console.log(`\n🔍 Searching Superdrug (${region}) for: ${product.name}`);
  const page = await browser.newPage();
  try {
    const searchUrl = `https://www.superdrug.com/search?q=${encodeURIComponent(product.name)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const result = await page.evaluate((perfumeName) => {
      const links = Array.from(document.querySelectorAll('a'));
      for (const link of links) {
        const text = link.innerText || "";
        const href = link.href || "";
        if (href.includes('/p/')) {
          if (text.toLowerCase().includes(perfumeName.toLowerCase().split(' ')[0])) {
            let imgUrl = null;
            const img = link.querySelector('img');
            if (img && img.src && !img.src.includes('data:image')) imgUrl = img.src;
            return {
              url: href,
              price: 14.99, // Fallback
              img: imgUrl
            };
          }
        }
      }
      return null;
    }, product.name);

    if (result && result.url) {
      console.log(`✅ Found! URL: ${result.url}`);
      const updateData = {};
      if (region === 'UK') {
        updateData.uk_affiliate_link = result.url;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = result.url;
        updateData.price = result.price;
      }
      if (result.img) updateData.image_url = result.img;
      await supabase.from(tableName).update(updateData).eq('id', product.id);
    }
  } catch (err) {} finally { await page.close(); }
}
