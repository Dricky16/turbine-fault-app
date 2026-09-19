-- Baccarat Rouge 540 by Maison Francis Kurkdjian
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('37eea8ed-a7be-4460-ba74-73327b6a06a8', 'Baccarat Rouge 540', 'Maison Francis Kurkdjian', 325.0, 'https://media.neimanmarcus.com/f_auto,q_auto:low,ar_4:5,c_fill,dpr_2.0,w_420/01/nm_4631370_100000_m') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('b2b9b6db-ab52-462a-938f-1f2d658e25b2', '37eea8ed-a7be-4460-ba74-73327b6a06a8', 'Red Temptation', 'Zara', 22.99, 95, 'https://static.zara.net/assets/public/ae45/b53b/86754ec8949f/cba45fb5a759/00120256999-e1/00120256999-e1.jpg?ts=1680104689255', 'https://www.google.com/search?q=buy+Zara+Red+Temptation') ON CONFLICT DO NOTHING;

-- Libre by Yves Saint Laurent
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('abe540c1-ad0c-41de-bf37-69023317cc1b', 'Libre', 'Yves Saint Laurent', 155.0, 'https://www.sephora.com/productimages/sku/s2249746-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('e2d4189d-b51e-4fe3-aa12-c27d77dfddcd', 'abe540c1-ad0c-41de-bf37-69023317cc1b', 'Golden Decade', 'Zara', 25.99, 90, 'https://static.zara.net/assets/public/443c/64cd/41834f3b89fa/460fb4121ba5/00120258999-e1/00120258999-e1.jpg?ts=1672323675034', 'https://www.google.com/search?q=buy+Zara+Golden+Decade') ON CONFLICT DO NOTHING;

-- Roses Vanille by Mancera
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('0fddfc9a-7e62-43e3-b4df-386adc187c3f', 'Roses Vanille', 'Mancera', 180.0, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('e4f84346-e0e2-4bb1-89a8-7f0300a05d84', '0fddfc9a-7e62-43e3-b4df-386adc187c3f', 'Rose Gourmand', 'Zara', 25.99, 92, 'https://static.zara.net/assets/public/1344/218a/927440b8bb07/c3290f670f59/00120257999-e1/00120257999-e1.jpg?ts=1680104655513', 'https://www.google.com/search?q=buy+Zara+Rose+Gourmand') ON CONFLICT DO NOTHING;

-- Chance Eau Tendre by Chanel
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('f6a57a94-547f-4b57-a628-dcda64729d1b', 'Chance Eau Tendre', 'Chanel', 135.0, 'https://www.sephora.com/productimages/sku/s1237379-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('c52b9b95-b2e7-4cfd-9f8f-e0b1ec3c6d71', 'f6a57a94-547f-4b57-a628-dcda64729d1b', 'Apple Juice', 'Zara', 17.99, 85, 'https://static.zara.net/assets/public/7bf0/f838/039a4897bcce/8d374492bf25/00110255999-e1/00110255999-e1.jpg?ts=1690539144445', 'https://www.google.com/search?q=buy+Zara+Apple+Juice') ON CONFLICT DO NOTHING;

-- Wood Sage & Sea Salt by Jo Malone
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('58ad604a-4a22-4faf-90e1-8f371355d03b', 'Wood Sage & Sea Salt', 'Jo Malone', 165.0, 'https://www.sephora.com/productimages/sku/s1642875-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('76f4f715-e7c0-462d-8794-097a87e7df82', '58ad604a-4a22-4faf-90e1-8f371355d03b', 'Ebony Wood', 'Zara', 29.99, 88, 'https://static.zara.net/assets/public/2f17/c9cb/b4b341fbbd0c/6e0f2d4090b4/00110260999-e1/00110260999-e1.jpg?ts=1672323675034', 'https://www.google.com/search?q=buy+Zara+Ebony+Wood') ON CONFLICT DO NOTHING;
INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('ccfda19b-e7a9-426e-956e-198a86016cb3', '58ad604a-4a22-4faf-90e1-8f371355d03b', 'Suddenly Salted Breeze', 'Lidl', 5.99, 80, 'https://m.media-amazon.com/images/I/51bA9YyE9XL.jpg', 'https://www.google.com/search?q=buy+Lidl+Suddenly+Salted+Breeze') ON CONFLICT DO NOTHING;

-- Black Opium by Yves Saint Laurent
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('a6db0d4f-2279-4b5e-8a0e-5a075c1e8637', 'Black Opium', 'Yves Saint Laurent', 155.0, 'https://www.sephora.com/productimages/sku/s1688852-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('e175176b-5265-46a6-8650-ee3c437a4188', 'a6db0d4f-2279-4b5e-8a0e-5a075c1e8637', 'Gardenia', 'Zara', 17.99, 87, 'https://static.zara.net/assets/public/56d5/d321/3655452d9b62/b8f1bcff4f5e/00110011999-e1/00110011999-e1.jpg?ts=1690539144445', 'https://www.google.com/search?q=buy+Zara+Gardenia') ON CONFLICT DO NOTHING;

-- Coco Mademoiselle by Chanel
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('32bba1e5-7225-4868-af0d-f702292a7533', 'Coco Mademoiselle', 'Chanel', 135.0, 'https://www.sephora.com/productimages/sku/s1498112-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('7957a129-ba10-4c9d-aacd-775a6f2153c3', '32bba1e5-7225-4868-af0d-f702292a7533', 'Suddenly Madame Glamour', 'Lidl', 5.99, 95, 'https://m.media-amazon.com/images/I/61r598YI+TL.jpg', 'https://www.google.com/search?q=buy+Lidl+Suddenly+Madame+Glamour') ON CONFLICT DO NOTHING;

-- La Vie Est Belle by Lancôme
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('16d470ce-bcc7-4f6e-9c20-599491c92064', 'La Vie Est Belle', 'Lancôme', 150.0, 'https://www.sephora.com/productimages/sku/s1448653-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('43b39b26-17b6-4b23-9618-0406a73b8698', '16d470ce-bcc7-4f6e-9c20-599491c92064', 'Femelle', 'Lidl', 5.99, 90, 'https://m.media-amazon.com/images/I/41-q0f8jFkL.jpg', 'https://www.google.com/search?q=buy+Lidl+Femelle') ON CONFLICT DO NOTHING;
INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('8a8e0f57-f38e-4ec0-80d5-0f173460dcb3', '16d470ce-bcc7-4f6e-9c20-599491c92064', 'Lacura Je Suis Belle', 'Aldi', 6.99, 91, 'https://m.media-amazon.com/images/I/41-q0f8jFkL.jpg', 'https://www.google.com/search?q=buy+Aldi+Lacura+Je+Suis+Belle') ON CONFLICT DO NOTHING;

-- Lost Cherry by Tom Ford
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('9ee10e3c-37f4-4251-bba2-c269bedb1c1e', 'Lost Cherry', 'Tom Ford', 395.0, 'https://www.sephora.com/productimages/sku/s2133486-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('60ebbf8f-7ffd-41cc-acc7-f0a988a710c6', '9ee10e3c-37f4-4251-bba2-c269bedb1c1e', 'Suddenly Cherry Love', 'Lidl', 5.99, 89, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg', 'https://www.google.com/search?q=buy+Lidl+Suddenly+Cherry+Love') ON CONFLICT DO NOTHING;

-- Gypsy Water by Byredo
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('4b515c16-bce7-4f0f-8dc0-f9522d43380b', 'Gypsy Water', 'Byredo', 225.0, 'https://www.sephora.com/productimages/sku/s2735746-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('41fb6f65-46b5-433b-ada4-064eee7c564c', '4b515c16-bce7-4f0f-8dc0-f9522d43380b', 'Suddenly Bohemian Water', 'Lidl', 5.99, 85, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg', 'https://www.google.com/search?q=buy+Lidl+Suddenly+Bohemian+Water') ON CONFLICT DO NOTHING;

-- Flowerbomb by Viktor&Rolf
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('52681c76-3b06-493a-8d2d-41a18934f7ed', 'Flowerbomb', 'Viktor&Rolf', 145.0, 'https://www.sephora.com/productimages/sku/s1377159-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('816f43b4-b483-4399-bd54-e90e9aab574f', '52681c76-3b06-493a-8d2d-41a18934f7ed', 'Lacura Floral Love', 'Aldi', 6.99, 94, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg', 'https://www.google.com/search?q=buy+Aldi+Lacura+Floral+Love') ON CONFLICT DO NOTHING;

-- Si Passione by Giorgio Armani
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('896da11e-2b22-4d28-85cd-88427a4e47c8', 'Si Passione', 'Giorgio Armani', 155.0, 'https://www.sephora.com/productimages/sku/s2035301-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('f63c4315-5003-41b6-96d6-2d9b1051214f', '896da11e-2b22-4d28-85cd-88427a4e47c8', 'Lacura Mon Amour', 'Aldi', 6.99, 89, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg', 'https://www.google.com/search?q=buy+Aldi+Lacura+Mon+Amour') ON CONFLICT DO NOTHING;

-- Le Male by Jean Paul Gaultier
INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('a664eaf9-3115-400a-8794-fd318646c176', 'Le Male', 'Jean Paul Gaultier', 120.0, 'https://www.sephora.com/productimages/sku/s250756-main-zoom.jpg') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('44e6fb2d-2bdd-4b4d-aded-2654c8027c4e', 'a664eaf9-3115-400a-8794-fd318646c176', 'Lacura Gentleman', 'Aldi', 6.99, 90, 'https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg', 'https://www.google.com/search?q=buy+Aldi+Lacura+Gentleman') ON CONFLICT DO NOTHING;

