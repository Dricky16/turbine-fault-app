import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  try {
    const res = await axios.get('https://www.brownthomas.com/beauty/fragrance/?sz=48', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(res.data);
    // Usually there's a total count somewhere like "1452 results"
    const countText = $('.result-count').text().trim();
    if (countText) {
       console.log("Count found:", countText);
    } else {
       // Look for data-total or similar
       const total = $('.search-result-content').attr('data-total-count') || 'Unknown';
       console.log("Fallback count check. Is there a total attribute?", total);
       console.log("Raw HTML sample:", res.data.substring(0, 1000));
    }
  } catch (e) {
    console.log("Blocked by Brown Thomas anti-bot.");
  }
}
run();
