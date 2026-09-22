import uuid

data = [
    # ZARA
    {
        "original_name": "Baccarat Rouge 540",
        "original_brand": "Maison Francis Kurkdjian",
        "original_price": 325.00,
        "original_image": "https://media.neimanmarcus.com/f_auto,q_auto:low,ar_4:5,c_fill,dpr_2.0,w_420/01/nm_4631370_100000_m",
        "dupes": [
            {"name": "Red Temptation", "brand": "Zara", "price": 22.99, "similarity": 95, "image": "https://static.zara.net/assets/public/ae45/b53b/86754ec8949f/cba45fb5a759/00120256999-e1/00120256999-e1.jpg?ts=1680104689255"}
        ]
    },
    {
        "original_name": "Libre",
        "original_brand": "Yves Saint Laurent",
        "original_price": 155.00,
        "original_image": "https://www.sephora.com/productimages/sku/s2249746-main-zoom.jpg",
        "dupes": [
            {"name": "Golden Decade", "brand": "Zara", "price": 25.99, "similarity": 90, "image": "https://static.zara.net/assets/public/443c/64cd/41834f3b89fa/460fb4121ba5/00120258999-e1/00120258999-e1.jpg?ts=1672323675034"}
        ]
    },
    {
        "original_name": "Roses Vanille",
        "original_brand": "Mancera",
        "original_price": 180.00,
        "original_image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg",
        "dupes": [
            {"name": "Rose Gourmand", "brand": "Zara", "price": 25.99, "similarity": 92, "image": "https://static.zara.net/assets/public/1344/218a/927440b8bb07/c3290f670f59/00120257999-e1/00120257999-e1.jpg?ts=1680104655513"}
        ]
    },
    {
        "original_name": "Chance Eau Tendre",
        "original_brand": "Chanel",
        "original_price": 135.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1237379-main-zoom.jpg",
        "dupes": [
            {"name": "Apple Juice", "brand": "Zara", "price": 17.99, "similarity": 85, "image": "https://static.zara.net/assets/public/7bf0/f838/039a4897bcce/8d374492bf25/00110255999-e1/00110255999-e1.jpg?ts=1690539144445"}
        ]
    },
    {
        "original_name": "Wood Sage & Sea Salt",
        "original_brand": "Jo Malone",
        "original_price": 165.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1642875-main-zoom.jpg",
        "dupes": [
            {"name": "Ebony Wood", "brand": "Zara", "price": 29.99, "similarity": 88, "image": "https://static.zara.net/assets/public/2f17/c9cb/b4b341fbbd0c/6e0f2d4090b4/00110260999-e1/00110260999-e1.jpg?ts=1672323675034"},
            {"name": "Suddenly Salted Breeze", "brand": "Lidl", "price": 5.99, "similarity": 80, "image": "https://m.media-amazon.com/images/I/51bA9YyE9XL.jpg"}
        ]
    },
    {
        "original_name": "Black Opium",
        "original_brand": "Yves Saint Laurent",
        "original_price": 155.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1688852-main-zoom.jpg",
        "dupes": [
            {"name": "Gardenia", "brand": "Zara", "price": 17.99, "similarity": 87, "image": "https://static.zara.net/assets/public/56d5/d321/3655452d9b62/b8f1bcff4f5e/00110011999-e1/00110011999-e1.jpg?ts=1690539144445"}
        ]
    },
    # LIDL
    {
        "original_name": "Coco Mademoiselle",
        "original_brand": "Chanel",
        "original_price": 135.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1498112-main-zoom.jpg",
        "dupes": [
            {"name": "Suddenly Madame Glamour", "brand": "Lidl", "price": 5.99, "similarity": 95, "image": "https://m.media-amazon.com/images/I/61r598YI+TL.jpg"}
        ]
    },
    {
        "original_name": "La Vie Est Belle",
        "original_brand": "Lancôme",
        "original_price": 150.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1448653-main-zoom.jpg",
        "dupes": [
            {"name": "Femelle", "brand": "Lidl", "price": 5.99, "similarity": 90, "image": "https://m.media-amazon.com/images/I/41-q0f8jFkL.jpg"},
            {"name": "Lacura Je Suis Belle", "brand": "Aldi", "price": 6.99, "similarity": 91, "image": "https://m.media-amazon.com/images/I/41-q0f8jFkL.jpg"}
        ]
    },
    {
        "original_name": "Lost Cherry",
        "original_brand": "Tom Ford",
        "original_price": 395.00,
        "original_image": "https://www.sephora.com/productimages/sku/s2133486-main-zoom.jpg",
        "dupes": [
            {"name": "Suddenly Cherry Love", "brand": "Lidl", "price": 5.99, "similarity": 89, "image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg"}
        ]
    },
    {
        "original_name": "Gypsy Water",
        "original_brand": "Byredo",
        "original_price": 225.00,
        "original_image": "https://www.sephora.com/productimages/sku/s2735746-main-zoom.jpg",
        "dupes": [
            {"name": "Suddenly Bohemian Water", "brand": "Lidl", "price": 5.99, "similarity": 85, "image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg"}
        ]
    },
    # ALDI
    {
        "original_name": "Flowerbomb",
        "original_brand": "Viktor&Rolf",
        "original_price": 145.00,
        "original_image": "https://www.sephora.com/productimages/sku/s1377159-main-zoom.jpg",
        "dupes": [
            {"name": "Lacura Floral Love", "brand": "Aldi", "price": 6.99, "similarity": 94, "image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg"}
        ]
    },
    {
        "original_name": "Si Passione",
        "original_brand": "Giorgio Armani",
        "original_price": 155.00,
        "original_image": "https://www.sephora.com/productimages/sku/s2035301-main-zoom.jpg",
        "dupes": [
            {"name": "Lacura Mon Amour", "brand": "Aldi", "price": 6.99, "similarity": 89, "image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg"}
        ]
    },
    {
        "original_name": "Le Male",
        "original_brand": "Jean Paul Gaultier",
        "original_price": 120.00,
        "original_image": "https://www.sephora.com/productimages/sku/s250756-main-zoom.jpg",
        "dupes": [
            {"name": "Lacura Gentleman", "brand": "Aldi", "price": 6.99, "similarity": 90, "image": "https://m.media-amazon.com/images/I/51r+P9L9uPL.jpg"}
        ]
    }
]

sql = ""

for item in data:
    # We will use subqueries to handle inserting and linking by name so it's idempotent-ish and easy to run
    # Wait, the best way in standard SQL to get the ID is to insert and then we can use a CTE or just generate the UUID here.
    # We will generate UUIDs here so the script is self-contained.
    original_id = str(uuid.uuid4())
    
    # Insert Original
    sql += f"-- {item['original_name']} by {item['original_brand']}\n"
    sql += f"INSERT INTO perfumes (id, name, brand, price, image_url) VALUES ('{original_id}', '{item['original_name']}', '{item['original_brand']}', {item['original_price']}, '{item['original_image']}') ON CONFLICT DO NOTHING;\n\n"
    
    for dupe in item['dupes']:
        dupe_id = str(uuid.uuid4())
        sql += f"INSERT INTO dupes (id, original_id, name, brand, price, similarity_match, image_url, affiliate_link) VALUES ('{dupe_id}', '{original_id}', '{dupe['name']}', '{dupe['brand']}', {dupe['price']}, {dupe['similarity']}, '{dupe['image']}', 'https://www.google.com/search?q=buy+{dupe['brand'].replace(' ', '+')}+{dupe['name'].replace(' ', '+')}') ON CONFLICT DO NOTHING;\n"
    
    sql += "\n"

with open('populate_dupes.sql', 'w') as f:
    f.write(sql)
print("SQL script generated!")
