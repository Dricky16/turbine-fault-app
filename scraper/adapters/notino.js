import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function scrapeNotino(browser, product, supabase, tableName, region = 'IE') {
  console.log(`\n🔍 Searching Notino (${region}) via DuckDuckGo for: ${product.brand} ${product.name}`);
  const domain = region === 'UK' ? 'co.uk' : 'ie';
  
  let decodedUrl = null;
  const searchPage = await browser.newPage();
  
  try {
    const query = `site:notino.${domain} "${product.brand} ${product.name}"`;
    await searchPage.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    decodedUrl = await searchPage.evaluate(() => {
       const links = Array.from(document.querySelectorAll('.result__url'));
       for (const link of links) {
          const url = link.getAttribute('href');
          if (url && url.includes('uddg=') && url.includes('notino.')) {
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
  console.log(`📸 Extracting Price and Image from Notino...`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let updateData = {};
  
  try {
    await page.goto(decodedUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));
    
    const details = await page.evaluate((region) => {
      let priceText = null;
      let imageUrl = null;
      
      const priceEl = document.querySelector('[data-testid="price-component"]');
      if (priceEl) priceText = priceEl.innerText;
      
      const imgEl = document.querySelector('img[src*="notinoimg.com"]');
      if (imgEl) imageUrl = imgEl.src;
      
      return { priceText, imageUrl };
    }, region);

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
    console.log(`❌ Failed to load Notino product page: ${error.message}`);
  } finally {
    await page.close();
  }
}
