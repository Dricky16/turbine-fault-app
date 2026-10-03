import axios from 'axios';
import * as cheerio from 'cheerio';

async function search(query) {
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(res.data);
    let firstUrl = null;
    $('.result__url').each((i, el) => {
      const url = $(el).attr('href');
      if (url && url.includes('zara.com') && !firstUrl) firstUrl = url;
    });
    console.log("DDG Result:", firstUrl);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
search('site:zara.com/ie/en "Golden Decade" perfume');
