import uuid

data = [
    # More ZARA
    {
        "original_name": "My Way",
        "original_brand": "Giorgio Armani",
        "original_price": 150.00,
        "original_link": "https://www.boots.ie/giorgio-armani-my-way-eau-de-parfum-50ml-10283088",
        "dupes": [
            {"name": "Sublime Epoque", "brand": "Zara", "price": 22.99, "similarity": 89, "link": "https://www.zara.com/ie/en/sublime-epoque-80-ml-p20120261.html"}
        ]
    },
    {
        "original_name": "Miss Dior Blooming Bouquet",
        "original_brand": "Dior",
        "original_price": 140.00,
        "original_link": "https://www.brownthomas.com/brands/dior/fragrance/miss-dior/miss-dior-blooming-bouquet/77x1406x150917.html",
        "dupes": [
            {"name": "Nude Bouquet", "brand": "Zara", "price": 17.99, "similarity": 88, "link": "https://www.zara.com/ie/en/nude-bouquet-100-ml-p20110254.html"}
        ]
    },
    {
        "original_name": "Imagination",
        "original_brand": "Louis Vuitton",
        "original_price": 260.00,
        "original_link": "https://eu.louisvuitton.com/eng-e1/products/imagination-nvprod2970054v",
        "dupes": [
            {"name": "Sunrise on Red Sand Dunes", "brand": "Zara", "price": 25.99, "similarity": 91, "link": "https://www.zara.com/ie/en/sunrise-on-red-sand-dunes-100-ml-p20220130.html"}
        ]
    },
    {
        "original_name": "Aventus",
        "original_brand": "Creed",
        "original_price": 295.00,
        "original_link": "https://www.brownthomas.com/brands/creed/aventus-eau-de-parfum-50ml/77x3005x1110041.html",
        "dupes": [
            {"name": "Vibrant Leather", "brand": "Zara", "price": 25.99, "similarity": 85, "link": "https://www.zara.com/ie/en/vibrant-leather-100-ml-p20220123.html"},
            {"name": "Club de Nuit Intense Man", "brand": "Armaf", "price": 35.00, "similarity": 95, "link": "https://www.notino.ie/armaf/club-de-nuit-intense-man-eau-de-toilette-for-men/"}
        ]
    },
    {
        "original_name": "Angels' Share",
        "original_brand": "Kilian",
        "original_price": 235.00,
        "original_link": "https://www.brownthomas.com/brands/kilian/angels-share-eau-de-parfum-50ml/77x2991x2450370.html",
        "dupes": [
            {"name": "Sand Desert at Sunset", "brand": "Zara", "price": 29.99, "similarity": 92, "link": "https://www.zara.com/ie/en/sand-desert-at-sunset-100-ml-p20220131.html"}
        ]
    },
    {
        "original_name": "Sauvage",
        "original_brand": "Dior",
        "original_price": 115.00,
        "original_link": "https://www.boots.ie/dior-sauvage-eau-de-toilette-100ml-10202999",
        "dupes": [
            {"name": "Night Pour Homme", "brand": "Zara", "price": 19.99, "similarity": 86, "link": "https://www.zara.com/ie/en/night-pour-homme-ii-100-ml-p20220101.html"}
        ]
    },
    {
        "original_name": "Acqua Di Gio",
        "original_brand": "Giorgio Armani",
        "original_price": 110.00,
        "original_link": "https://www.boots.ie/giorgio-armani-acqua-di-gio-eau-de-toilette-100ml-10006733",
        "dupes": [
            {"name": "Lisboa", "brand": "Zara", "price": 15.99, "similarity": 84, "link": "https://www.zara.com/ie/en/lisboa-colombo-avenida-do-colegio-militar-100-ml-p20220110.html"}
        ]
    },
    {
        "original_name": "Santal 33",
        "original_brand": "Le Labo",
        "original_price": 230.00,
        "original_link": "https://www.brownthomas.com/brands/le-labo/santal-33-eau-de-parfum-50ml/77x3005x1110041.html",
        "dupes": [
            {"name": "Energetically New York", "brand": "Zara", "price": 25.99, "similarity": 87, "link": "https://www.zara.com/ie/en/energetically-new-york-75-ml-p20110034.html"}
        ]
    },
    # Notino Middle Eastern Dupes
    {
        "original_name": "Delina",
        "original_brand": "Parfums de Marly",
        "original_price": 275.00,
        "original_link": "https://www.notino.ie/parfums-de-marly/delina-eau-de-parfum-for-women/",
        "dupes": [
            {"name": "Club de Nuit Woman", "brand": "Armaf", "price": 38.00, "similarity": 90, "link": "https://www.notino.ie/armaf/club-de-nuit-woman-eau-de-parfum-for-women/"}
        ]
    },
    {
        "original_name": "Erba Pura",
        "original_brand": "Xerjoff",
        "original_price": 250.00,
        "original_link": "https://www.brownthomas.com/brands/xerjoff/erba-pura-eau-de-parfum-50ml/77x3005x1110041.html",
        "dupes": [
            {"name": "Ana Abiyedh", "brand": "Lattafa", "price": 20.00, "similarity": 93, "link": "https://www.notino.ie/lattafa/ana-abiyedh-eau-de-parfum-unisex/"}
        ]
    }
]

sql = ""

for item in data:
    original_id = str(uuid.uuid4())
    sql += f"-- {item['original_name']} by {item['original_brand']}\n"
    sql += f"INSERT INTO perfumes (id, name, brand, price, affiliate_link) VALUES ('{original_id}', '{item['original_name']}', '{item['original_brand']}', {item['original_price']}, '{item['original_link']}') ON CONFLICT DO NOTHING;\n\n"
    for dupe in item['dupes']:
        dupe_id = str(uuid.uuid4())
        sql += f"INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, affiliate_link) VALUES ('{dupe_id}', '{original_id}', '{dupe['name']}', '{dupe['brand']}', {dupe['price']}, {dupe['similarity']}, '{dupe['link']}') ON CONFLICT DO NOTHING;\n"
    sql += "\n"

with open('populate_more.sql', 'w') as f:
    f.write(sql)
print("More SQL generated!")
