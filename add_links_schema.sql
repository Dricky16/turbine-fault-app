ALTER TABLE perfumes ADD COLUMN affiliate_link TEXT;
ALTER TABLE dupes ADD COLUMN image_url TEXT;

-- Let's update our Baccarat Rouge dummy data so you can see it in action!
UPDATE perfumes 
SET 
  image_url = 'https://media.neimanmarcus.com/f_auto,q_auto:low,ar_4:5,c_fill,dpr_2.0,w_420/01/nm_4631370_100000_m',
  affiliate_link = 'https://www.neimanmarcus.com/p/maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum-prod185880196'
WHERE name = 'Baccarat Rouge 540';

UPDATE dupes
SET
  image_url = 'https://m.media-amazon.com/images/I/51r+P9L9uPL._SX300_SY300_QL70_FMwebp_.jpg'
WHERE name = 'Club de Nuit Untold';
