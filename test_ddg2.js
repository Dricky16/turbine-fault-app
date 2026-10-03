import axios from 'axios';
import * as cheerio from 'cheerio';

async function search(query) {
  const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  $('.result__url').each((i, el) => {
    const url = $(el).attr('href');
    console.log("Raw URL:", url);
  });
}
search('site:zara.com/ie/en "Golden Decade" perfume');
