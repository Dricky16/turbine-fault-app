import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  const query = `site:zara.com/ie/en "Golden Decade" perfume`;
  const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
  });
  console.log("Status:", res.status);
  const $ = cheerio.load(res.data);
  const results = $('.result__url').length;
  console.log("Found .result__url elements:", results);
}
run();
