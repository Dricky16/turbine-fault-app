const axios = require('axios');
const cheerio = require('cheerio');

async function testBoots() {
  try {
    console.log("Testing Boots.ie...");
    const { data } = await axios.get('https://www.boots.ie/search/libre', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const title = $('title').text();
    console.log("Boots Title:", title);
    if (title.toLowerCase().includes('denied') || title.toLowerCase().includes('captcha')) {
      console.log("Boots blocked us.");
    }
  } catch(e) {
    console.log("Boots Error:", e.message);
  }
}

async function testNotino() {
  try {
    console.log("Testing Notino.ie...");
    const { data } = await axios.get('https://www.notino.ie/search/?q=libre', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const title = $('title').text();
    console.log("Notino Title:", title);
  } catch(e) {
    console.log("Notino Error:", e.message);
  }
}

async function run() {
  await testBoots();
  await testNotino();
}
run();
