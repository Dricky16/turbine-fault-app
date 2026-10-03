import Scraper from 'images-scraper';

const google = new Scraper({
  puppeteer: {
    headless: true,
  },
});

(async () => {
  const results = await google.scrape('Davidoff Cool Water perfume bottle white background', 1);
  console.log('results', results);
})();
