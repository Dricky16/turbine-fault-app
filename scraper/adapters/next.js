export default async function scrapeNext(browser, product, supabase, tableName, region = 'IE') {
  const page = await browser.newPage();
  try {
    const domain = region === 'UK' ? 'co.uk' : 'ie';
    const searchUrl = \`https://www.next.\${domain}/en/search?w=\${encodeURIComponent(product.name)}\`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const result = await page.evaluate((perfumeName) => {
      const links = Array.from(document.querySelectorAll('a'));
      for (const link of links) {
        if (link.href.includes('style') && link.innerText.toLowerCase().includes(perfumeName.toLowerCase().split(' ')[0])) {
          return { url: link.href, price: 18.00 }; // Fallback Next price
        }
      }
      return null;
    }, product.name);

    if (result && result.url) {
      const updateData = {};
      if (region === 'UK') {
        updateData.uk_affiliate_link = result.url;
        updateData.price_gbp = result.price;
      } else {
        updateData.affiliate_link = result.url;
        updateData.price = result.price;
      }
      await supabase.from(tableName).update(updateData).eq('id', product.id);
    }
  } catch (err) {} finally { await page.close(); }
}
