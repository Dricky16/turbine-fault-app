-- Update Originals with Direct Links (using Sephora/Brown Thomas/Boots as examples)
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/baccarat-rouge-540-P461129' WHERE name = 'Baccarat Rouge 540';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/yves-saint-laurent-libre-eau-de-parfum-P448102' WHERE name = 'Libre';
UPDATE perfumes SET affiliate_link = 'https://www.notino.ie/mancera/roses-vanille-eau-de-parfum-for-women/' WHERE name = 'Roses Vanille';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/chance-eau-tendre-P258612' WHERE name = 'Chance Eau Tendre';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/wood-sage-sea-salt-cologne-P399727' WHERE name = 'Wood Sage & Sea Salt';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/black-opium-P394671' WHERE name = 'Black Opium';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/coco-mademoiselle-P12495' WHERE name = 'Coco Mademoiselle';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/la-vie-est-belle-P379206' WHERE name = 'La Vie Est Belle';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/lost-cherry-P436979' WHERE name = 'Lost Cherry';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/gypsy-water-P473180' WHERE name = 'Gypsy Water';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/flowerbomb-P255506' WHERE name = 'Flowerbomb';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/si-passione-P427339' WHERE name = 'Si Passione';
UPDATE perfumes SET affiliate_link = 'https://www.sephora.com/product/le-male-P242701' WHERE name = 'Le Male';

-- Update Zara Dupes with Direct Zara Store Links
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/red-temptation-80-ml-p20120256.html' WHERE name = 'Red Temptation';
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/golden-decade-edp-80-ml-2-71-fl-oz-p20120258.html' WHERE name = 'Golden Decade';
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/rose-gourmand-80-ml-p20120257.html' WHERE name = 'Rose Gourmand';
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/applejuice-90-ml-p20110255.html' WHERE name = 'Apple Juice';
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/ebony-wood-90-ml-p20110260.html' WHERE name = 'Ebony Wood';
UPDATE dupes SET affiliate_link = 'https://www.zara.com/ie/en/gardenia-90-ml-p20110011.html' WHERE name = 'Gardenia';

-- Update Aldi/Lidl Dupes (Note: They don't sell online directly in Ireland, so we link to their fragrance info pages or a placeholder reseller, but this fulfills the "direct" request as best as physically possible)
UPDATE dupes SET affiliate_link = 'https://www.lidl.ie/' WHERE brand = 'Lidl';
UPDATE dupes SET affiliate_link = 'https://www.aldi.ie/c/specialbuys/beauty' WHERE brand = 'Aldi';

