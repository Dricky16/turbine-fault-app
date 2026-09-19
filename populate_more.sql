-- My Way by Giorgio Armani
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('ee1d542a-eb08-4d45-9a0a-6ce3ccc13ca6', 'My Way', 'Giorgio Armani', 150.0, 'https://www.boots.ie/giorgio-armani-my-way-eau-de-parfum-50ml-10283088') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('a700aad1-22e6-46a8-80b5-cfcfb09eee3a', 'ee1d542a-eb08-4d45-9a0a-6ce3ccc13ca6', 'Sublime Epoque', 'Zara', 22.99, 89, 'https://www.zara.com/ie/en/sublime-epoque-80-ml-p20120261.html') ON CONFLICT DO NOTHING;

-- Miss Dior Blooming Bouquet by Dior
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('8d753e31-2668-4e35-807c-725501aee47f', 'Miss Dior Blooming Bouquet', 'Dior', 140.0, 'https://www.brownthomas.com/brands/dior/fragrance/miss-dior/miss-dior-blooming-bouquet/77x1406x150917.html') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('8f4e4359-1f08-4a50-9935-4a5f2a3de4c6', '8d753e31-2668-4e35-807c-725501aee47f', 'Nude Bouquet', 'Zara', 17.99, 88, 'https://www.zara.com/ie/en/nude-bouquet-100-ml-p20110254.html') ON CONFLICT DO NOTHING;

-- Imagination by Louis Vuitton
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('e4d40366-f951-4503-a444-fe1e25658720', 'Imagination', 'Louis Vuitton', 260.0, 'https://eu.louisvuitton.com/eng-e1/products/imagination-nvprod2970054v') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('30aa3f61-0218-4e5f-b65e-8e036805fb74', 'e4d40366-f951-4503-a444-fe1e25658720', 'Sunrise on Red Sand Dunes', 'Zara', 25.99, 91, 'https://www.zara.com/ie/en/sunrise-on-red-sand-dunes-100-ml-p20220130.html') ON CONFLICT DO NOTHING;

-- Aventus by Creed
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('d2e9045f-6803-4541-a629-d362b4d5b62e', 'Aventus', 'Creed', 295.0, 'https://www.brownthomas.com/brands/creed/aventus-eau-de-parfum-50ml/77x3005x1110041.html') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('3e8eb941-f341-421d-934e-a9ef4a44071d', 'd2e9045f-6803-4541-a629-d362b4d5b62e', 'Vibrant Leather', 'Zara', 25.99, 85, 'https://www.zara.com/ie/en/vibrant-leather-100-ml-p20220123.html') ON CONFLICT DO NOTHING;
INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('917de89c-425a-4886-b007-3059679745b3', 'd2e9045f-6803-4541-a629-d362b4d5b62e', 'Club de Nuit Intense Man', 'Armaf', 35.0, 95, 'https://www.notino.ie/armaf/club-de-nuit-intense-man-eau-de-toilette-for-men/') ON CONFLICT DO NOTHING;

-- Angels' Share by Kilian
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('8996a472-650a-40ce-85ca-192484ef881d', 'Angels' Share', 'Kilian', 235.0, 'https://www.brownthomas.com/brands/kilian/angels-share-eau-de-parfum-50ml/77x2991x2450370.html') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('f7eb94e2-8388-407a-bcad-4c2130a7c0b0', '8996a472-650a-40ce-85ca-192484ef881d', 'Sand Desert at Sunset', 'Zara', 29.99, 92, 'https://www.zara.com/ie/en/sand-desert-at-sunset-100-ml-p20220131.html') ON CONFLICT DO NOTHING;

-- Sauvage by Dior
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('f5e0bf43-0c1c-4fc9-8a0a-7e3d97bd3046', 'Sauvage', 'Dior', 115.0, 'https://www.boots.ie/dior-sauvage-eau-de-toilette-100ml-10202999') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('bee14150-f416-45bc-ab6d-5147d46ee9a5', 'f5e0bf43-0c1c-4fc9-8a0a-7e3d97bd3046', 'Night Pour Homme', 'Zara', 19.99, 86, 'https://www.zara.com/ie/en/night-pour-homme-ii-100-ml-p20220101.html') ON CONFLICT DO NOTHING;

-- Acqua Di Gio by Giorgio Armani
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('5621fbea-004e-4911-bba0-95c7e0c98ab2', 'Acqua Di Gio', 'Giorgio Armani', 110.0, 'https://www.boots.ie/giorgio-armani-acqua-di-gio-eau-de-toilette-100ml-10006733') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('ef7e9c1e-bdd9-406f-9880-95b0798a8960', '5621fbea-004e-4911-bba0-95c7e0c98ab2', 'Lisboa', 'Zara', 15.99, 84, 'https://www.zara.com/ie/en/lisboa-colombo-avenida-do-colegio-militar-100-ml-p20220110.html') ON CONFLICT DO NOTHING;

-- Santal 33 by Le Labo
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('6b2257f3-dac1-4da5-a0e9-caf676f898fe', 'Santal 33', 'Le Labo', 230.0, 'https://www.brownthomas.com/brands/le-labo/santal-33-eau-de-parfum-50ml/77x3005x1110041.html') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('32791d2b-1458-4c7a-8bfa-0f077cf8d400', '6b2257f3-dac1-4da5-a0e9-caf676f898fe', 'Energetically New York', 'Zara', 25.99, 87, 'https://www.zara.com/ie/en/energetically-new-york-75-ml-p20110034.html') ON CONFLICT DO NOTHING;

-- Delina by Parfums de Marly
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('115eaa2f-10b4-4451-9cb4-9c6178318dcd', 'Delina', 'Parfums de Marly', 275.0, 'https://www.notino.ie/parfums-de-marly/delina-eau-de-parfum-for-women/') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('0b734248-127e-4043-85b1-1cbc25aecf3f', '115eaa2f-10b4-4451-9cb4-9c6178318dcd', 'Club de Nuit Woman', 'Armaf', 38.0, 90, 'https://www.notino.ie/armaf/club-de-nuit-woman-eau-de-parfum-for-women/') ON CONFLICT DO NOTHING;

-- Erba Pura by Xerjoff
INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('1e9eb3e0-a292-4f16-a1a6-62c47a0c3d29', 'Erba Pura', 'Xerjoff', 250.0, 'https://www.brownthomas.com/brands/xerjoff/erba-pura-eau-de-parfum-50ml/77x3005x1110041.html') ON CONFLICT DO NOTHING;

INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('3ef2764f-453b-435a-b1be-f6d9cdffe9ea', '1e9eb3e0-a292-4f16-a1a6-62c47a0c3d29', 'Ana Abiyedh', 'Lattafa', 20.0, 93, 'https://www.notino.ie/lattafa/ana-abiyedh-eau-de-parfum-unisex/') ON CONFLICT DO NOTHING;

