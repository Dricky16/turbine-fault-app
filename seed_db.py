import os
import requests
import uuid

# Parse .env.local
env = {}
with open('.env.local') as f:
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env[k] = v

url = env.get('VITE_SUPABASE_URL')
key = env.get('VITE_SUPABASE_ANON_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

# The massive dataset
dataset = [
    # ALDI
    {"original": "Jo Malone Pomegranate Noir", "brand": "Jo Malone", "price": 118, "dupes": [{"name": "Pomegranate", "brand": "Aldi", "price": 6.99, "similarity": 85}]},
    {"original": "Jo Malone Lime Basil & Mandarin", "brand": "Jo Malone", "price": 118, "dupes": [{"name": "Lime, Basil & Mandarin", "brand": "Aldi", "price": 6.99, "similarity": 88}]},
    {"original": "Jo Malone Freesia & Pear", "brand": "Jo Malone", "price": 118, "dupes": [{"name": "Freesia & Pear", "brand": "Aldi", "price": 6.99, "similarity": 84}]},
    {"original": "Jo Malone Peony & Blush Suede", "brand": "Jo Malone", "price": 118, "dupes": [{"name": "Peony", "brand": "Aldi", "price": 6.99, "similarity": 87}]},
    {"original": "Creed Aventus", "brand": "Creed", "price": 295, "dupes": [{"name": "His Reign", "brand": "Aldi", "price": 6.99, "similarity": 80}]},
    {"original": "Creed Aventus for Her", "brand": "Creed", "price": 260, "dupes": [{"name": "Her Reign", "brand": "Aldi", "price": 6.99, "similarity": 78}]},
    {"original": "Paco Rabanne Olympea", "brand": "Paco Rabanne", "price": 95, "dupes": [{"name": "Empress", "brand": "Aldi", "price": 6.99, "similarity": 86}]},
    {"original": "Paco Rabanne Invictus", "brand": "Paco Rabanne", "price": 85, "dupes": [{"name": "Optimus", "brand": "Aldi", "price": 6.99, "similarity": 85}]},
    {"original": "Dior Sauvage", "brand": "Dior", "price": 115, "dupes": [{"name": "Savage", "brand": "Aldi", "price": 6.99, "similarity": 82}]},
    {"original": "Dior Miss Dior", "brand": "Dior", "price": 140, "dupes": [{"name": "Miss Elegance", "brand": "Aldi", "price": 6.99, "similarity": 81}]},
    {"original": "Carolina Herrera Good Girl", "brand": "Carolina Herrera", "price": 125, "dupes": [{"name": "Dark Blossom", "brand": "Aldi", "price": 6.99, "similarity": 84}]},
    {"original": "Mugler Alien", "brand": "Mugler", "price": 120, "dupes": [{"name": "Stellar", "brand": "Aldi", "price": 6.99, "similarity": 83}]},
    {"original": "Mugler Angel", "brand": "Mugler", "price": 130, "dupes": [{"name": "Guardian", "brand": "Aldi", "price": 6.99, "similarity": 80}]},
    {"original": "Marc Jacobs Daisy", "brand": "Marc Jacobs", "price": 95, "dupes": [{"name": "Floral Love", "brand": "Aldi", "price": 6.99, "similarity": 82}]},
    {"original": "YSL Black Opium", "brand": "Yves Saint Laurent", "price": 125, "dupes": [{"name": "Dark Opulence", "brand": "Aldi", "price": 6.99, "similarity": 85}]},

    # LIDL
    {"original": "Hugo Boss Boss Bottled", "brand": "Hugo Boss", "price": 85, "dupes": [{"name": "X-Bolt", "brand": "Lidl", "price": 5.99, "similarity": 88}]},
    {"original": "Paco Rabanne 1 Million", "brand": "Paco Rabanne", "price": 95, "dupes": [{"name": "Homme", "brand": "Lidl", "price": 5.99, "similarity": 84}]},
    {"original": "Davidoff Cool Water", "brand": "Davidoff", "price": 60, "dupes": [{"name": "Aqua Fresh", "brand": "Lidl", "price": 5.99, "similarity": 89}]},
    {"original": "Chanel Bleu de Chanel", "brand": "Chanel", "price": 120, "dupes": [{"name": "Deep Blue", "brand": "Lidl", "price": 5.99, "similarity": 81}]},
    {"original": "Armani Code", "brand": "Giorgio Armani", "price": 95, "dupes": [{"name": "Code", "brand": "Lidl", "price": 5.99, "similarity": 82}]},
    {"original": "DKNY Be Delicious", "brand": "DKNY", "price": 75, "dupes": [{"name": "Aura en Rose", "brand": "Lidl", "price": 5.99, "similarity": 83}]},
    {"original": "Chloe Eau de Parfum", "brand": "Chloe", "price": 115, "dupes": [{"name": "Chalou", "brand": "Lidl", "price": 5.99, "similarity": 87}]},

    # ZARA (More extensive)
    {"original": "Byredo Mojave Ghost", "brand": "Byredo", "price": 200, "dupes": [{"name": "Waterlily Tea Dress", "brand": "Zara", "price": 25.99, "similarity": 82}]},
    {"original": "Byredo Bal d'Afrique", "brand": "Byredo", "price": 200, "dupes": [{"name": "Vetiver Pamplemousse", "brand": "Zara", "price": 25.99, "similarity": 85}]},
    {"original": "Jo Malone English Pear & Freesia", "brand": "Jo Malone", "price": 118, "dupes": [{"name": "Bohemian Bluebells", "brand": "Zara", "price": 25.99, "similarity": 81}]},
    {"original": "Jo Malone Oud & Bergamot", "brand": "Jo Malone", "price": 150, "dupes": [{"name": "Ebony Wood", "brand": "Zara", "price": 25.99, "similarity": 90}]},
    {"original": "Tom Ford Tobacco Vanille", "brand": "Tom Ford", "price": 295, "dupes": [{"name": "Warm Black", "brand": "Zara", "price": 15.99, "similarity": 84}]},
    {"original": "Tom Ford Neroli Portofino", "brand": "Tom Ford", "price": 295, "dupes": [{"name": "Amalfi Sunray", "brand": "Zara", "price": 25.99, "similarity": 86}]},
    {"original": "YSL Libre", "brand": "Yves Saint Laurent", "price": 155, "dupes": [{"name": "Destiny", "brand": "Zara", "price": 15.99, "similarity": 80}]},
    {"original": "Baccarat Rouge 540", "brand": "Maison Francis Kurkdjian", "price": 325, "dupes": [{"name": "For Him Red Edition", "brand": "Zara", "price": 22.99, "similarity": 85}]},
    {"original": "Dior J'adore", "brand": "Dior", "price": 150, "dupes": [{"name": "Rose", "brand": "Zara", "price": 15.99, "similarity": 75}]},
    {"original": "Dior Hypnotic Poison", "brand": "Dior", "price": 135, "dupes": [{"name": "Femme", "brand": "Zara", "price": 15.99, "similarity": 82}]},

    # NOTINO (Armaf, Lattafa, Afnan, Al Haramain)
    {"original": "Tom Ford Tuscan Leather", "brand": "Tom Ford", "price": 295, "dupes": [{"name": "La Yuqawam", "brand": "Rasasi", "price": 60, "similarity": 94}]},
    {"original": "Creed Silver Mountain Water", "brand": "Creed", "price": 295, "dupes": [{"name": "Club de Nuit Sillage", "brand": "Armaf", "price": 35, "similarity": 92}]},
    {"original": "Creed Millesime Imperial", "brand": "Creed", "price": 295, "dupes": [{"name": "Club de Nuit Milestone", "brand": "Armaf", "price": 35, "similarity": 91}]},
    {"original": "Xerjoff Naxos", "brand": "Xerjoff", "price": 250, "dupes": [{"name": "1981X", "brand": "Alexandria Fragrances", "price": 65, "similarity": 88}]}, # Not exactly Notino but popular
    {"original": "Maison Margiela By the Fireplace", "brand": "Maison Margiela", "price": 145, "dupes": [{"name": "Ameer Al Oudh Intense Oud", "brand": "Lattafa", "price": 20, "similarity": 90}]},
    {"original": "Parfums de Marly Layton", "brand": "Parfums de Marly", "price": 275, "dupes": [{"name": "Detour Noir", "brand": "Al Haramain", "price": 30, "similarity": 95}]},
    {"original": "Parfums de Marly Pegasus", "brand": "Parfums de Marly", "price": 275, "dupes": [{"name": "Craze", "brand": "Armaf", "price": 25, "similarity": 93}]},
    {"original": "Parfums de Marly Herod", "brand": "Parfums de Marly", "price": 275, "dupes": [{"name": "Radical Brown", "brand": "Armaf", "price": 25, "similarity": 89}]},
    {"original": "Tom Ford Oud Wood", "brand": "Tom Ford", "price": 295, "dupes": [{"name": "Woody Oud", "brand": "Maison Alhambra", "price": 25, "similarity": 85}]},
    {"original": "Tom Ford Bitter Peach", "brand": "Tom Ford", "price": 395, "dupes": [{"name": "Bright Peach", "brand": "Maison Alhambra", "price": 25, "similarity": 88}]},
    {"original": "Tom Ford Fucking Fabulous", "brand": "Tom Ford", "price": 395, "dupes": [{"name": "Fabulo Intense", "brand": "Maison Alhambra", "price": 25, "similarity": 90}]},
    {"original": "Roja Elysium", "brand": "Roja Parfums", "price": 300, "dupes": [{"name": "Zion", "brand": "Alexandria Fragrances", "price": 60, "similarity": 89}]},
    {"original": "Initio Oud for Greatness", "brand": "Initio", "price": 320, "dupes": [{"name": "Bade'e Al Oud Oud for Glory", "brand": "Lattafa", "price": 28, "similarity": 95}]},
    {"original": "Kilian Love Don't Be Shy", "brand": "Kilian", "price": 275, "dupes": [{"name": "Destino", "brand": "Oakcha", "price": 40, "similarity": 85}]}
]

def make_search_link(name, brand):
    # Depending on brand, generate a robust search link
    term = name.replace(" ", "+")
    if brand == "Zara":
        return f"https://www.zara.com/ie/en/search.html?searchTerm={term}"
    elif brand == "Aldi":
        return f"https://www.aldi.ie/search?q={term}"
    elif brand == "Lidl":
        # Lidl ie doesn't have a great search, but we can try
        return f"https://www.lidl.ie/q/search?q={term}"
    elif brand in ["Armaf", "Lattafa", "Rasasi", "Al Haramain", "Maison Alhambra"]:
        return f"https://www.notino.ie/search/?q={term}"
    else:
        # Default for luxury brands to brown thomas or boots
        return f"https://www.brownthomas.com/search?q={term}"

perfumes_inserted = 0
dupes_inserted = 0

for item in dataset:
    # 1. Insert Original
    original_id = str(uuid.uuid4())
    orig_link = make_search_link(item['original'], item['brand'])
    
    orig_data = {
        "id": original_id,
        "name": item['original'],
        "brand": item['brand'],
        "price": item['price'],
        "affiliate_link": orig_link
    }
    
    r = requests.post(f"{url}/rest/v1/perfumes", headers=headers, json=orig_data)
    if r.status_code in [201, 200]:
        perfumes_inserted += 1
    
    # 2. Insert Dupes
    for d in item['dupes']:
        dupe_id = str(uuid.uuid4())
        dupe_link = make_search_link(d['name'], d['brand'])
        
        dupe_data = {
            "id": dupe_id,
            "original_id": original_id,
            "name": d['name'],
            "brand": d['brand'],
            "price": d['price'],
            "similarity_match": d['similarity'],
            "affiliate_link": dupe_link
        }
        
        r2 = requests.post(f"{url}/rest/v1/dupes", headers=headers, json=dupe_data)
        if r2.status_code in [201, 200]:
            dupes_inserted += 1

print(f"Success! Inserted {perfumes_inserted} originals and {dupes_inserted} dupes.")

# Now let's update ALL EXISTING Zara links in the database to use the search URL
print("Fixing all existing Zara links...")
r = requests.get(f"{url}/rest/v1/dupes?brand=eq.Zara", headers={'apikey': key, 'Authorization': f'Bearer {key}'})
if r.status_code == 200:
    for dupe in r.json():
        term = dupe['name'].replace(" ", "+")
        new_link = f"https://www.zara.com/ie/en/search.html?searchTerm={term}"
        requests.patch(f"{url}/rest/v1/dupes?id=eq.{dupe['id']}", headers=headers, json={"affiliate_link": new_link})

print("Done fixing Zara links!")
