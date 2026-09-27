export default async function scrapeZara(browser, product, supabase, tableName, region = 'IE') {
  console.log(`\n🔍 Searching Zara (${region}) via DuckDuckGo for: ${product.name}`);
  const domain = region === 'UK' ? 'uk' : 'ie';
  
  let decodedUrl = null;
  const searchPage = await browser.newPage();
  
  try {
    const query = `site:zara.com/${domain}/en "${product.name}" perfume`;
    await searchPage.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    decodedUrl = await searchPage.evaluate(() => {
       const links = Array.from(document.querySelectorAll('.result__url'));
       for (const link of links) {
          const url = link.getAttribute('href');
          if (url && url.includes('uddg=') && url.includes('zara.com')) {
             const match = url.match(/uddg=([^&]+)/);
             if (match) return decodeURIComponent(match[1]);
          }
       }
       return null;
    });
  } catch(e) {
    console.log(`❌ DDG search failed: ${e.message}`);
  } finally {
    await searchPage.close();
  }

  if (!decodedUrl) {
    console.log(`❌ Could not find exact direct product link on DuckDuckGo.`);
    return;
  }
  
  console.log(`✅ DDG found direct link: ${decodedUrl}`);
  console.log(`📸 Extracting Price and Image from Zara...`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let updateData = {};
  
  try {
    await page.goto(decodedUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));
    
    const currentUrl = page.url();
    if (!currentUrl.includes('.html')) {
       console.log(`❌ Zara redirected to home page (likely Out of Stock in ${region}).`);
       await page.close();
       return;
    }

    const details = await page.evaluate(() => {
      let priceText = null;
      let imageUrl = null;
      
      const priceSelectors = ['.price__amount-current', '.price-current__amount', '.price__amount', 'span[data-qa-qualifier="price"]'];
      for (const sel of priceSelectors) {
         const el = document.querySelector(sel);
         if (el) {
           priceText = el.innerText.trim();
           break;
         }
      }
      
      const imgSelectors = ['picture img.media-image__image', 'img.media-image__image', '.product-detail-images img'];
      for (const sel of imgSelectors) {
         const el = document.querySelector(sel);
         if (el && el.src && !el.src.includes('data:image')) {
           imageUrl = el.src;
           break;
         }
      }
      return { priceText, imageUrl };
    });

    let numericPrice = null;
    if (details.priceText) {
      numericPrice = parseFloat(details.priceText.replace(/[^0-9.]/g, ''));
    }

    if (region === 'UK') {
      updateData.uk_affiliate_link = decodedUrl;
      if (numericPrice) updateData.price_gbp = numericPrice;
    } else {
      updateData.affiliate_link = decodedUrl;
      if (numericPrice) updateData.price = numericPrice;
    }
    
    if (details.imageUrl) {
      updateData.image_url = details.imageUrl;
      console.log(`   📸 Extracted Image: ${details.imageUrl.substring(0, 50)}...`);
    }
    if (numericPrice) {
      console.log(`   💰 Extracted Price: ${numericPrice}`);
    }

    if (Object.keys(updateData).length > 0) {
      await supabase.from(tableName).update(updateData).eq('id', product.id);
      console.log(`✅ Saved direct ${region} affiliate link to database.`);
    } else {
      console.log(`❌ Failed to extract price/image from the product page.`);
    }

  } catch (error) {
    console.log(`❌ Failed to load Zara product page: ${error.message}`);
  } finally {
    await page.close();
  }
}
