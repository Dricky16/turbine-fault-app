import fs from 'fs';

// Compact format: [OriginalBrand, OriginalName, OrigPrice, Top, Heart, Base, DupesArray]
const rawData = [
  // JO MALONE 
  ["Jo Malone", "Pomegranate Noir", 118, "Pomegranate, Raspberry", "Pink Pepper, Clove", "Patchouli, Amber", [
    ["Aldi", "Pomegranate", 6.99, 90],
    ["Jenny Glow", "Pomegranate", 15, 92]
  ]],
  ["Jo Malone", "Lime Basil & Mandarin", 118, "Lime, Mandarin Orange", "Basil, Thyme", "Patchouli, Vetiver", [
    ["Aldi", "Lime, Basil & Mandarin", 6.99, 90],
    ["Jenny Glow", "Lime & Basil", 15, 93],
    ["Primark", "Mandarin & Basil", 8, 85]
  ]],
  ["Jo Malone", "Peony & Blush Suede", 118, "Red Apple", "Peony, Rose, Jasmine", "Suede", [
    ["Aldi", "Peony", 6.99, 88],
    ["Jenny Glow", "Peony", 15, 95]
  ]],
  ["Jo Malone", "Wood Sage & Sea Salt", 118, "Ambrette Seeds", "Sea Salt, Mineral Notes", "Sage, Guaiac Wood", [
    ["Jenny Glow", "Wood & Sage", 15, 95],
    ["Dossier", "Woody Sage", 29, 90],
    ["Oakcha", "Sea Salt & Sage", 35, 88]
  ]],
  ["Jo Malone", "Myrrh & Tonka", 150, "Lavender", "Omumbiri Myrrh", "Tonka Bean, Vanilla", [
    ["Jenny Glow", "Myrrh & Bean", 20, 92],
    ["Maison Alhambra", "Sceptre Malachite", 25, 90]
  ]],
  // TOM FORD
  ["Tom Ford", "Neroli Portofino", 240, "Bergamot, Mandarin Orange, Lemon", "African Orange Flower, Neroli", "Amber, Ambrette", [
    ["Maison Alhambra", "Porto Neroli", 25, 95],
    ["Ferrari", "Bright Neroli", 35, 85],
    ["Just Jack", "Neroli", 20, 88]
  ]],
  ["Tom Ford", "Bitter Peach", 260, "Peach, Blood Orange", "Rum, Cognac, Davana", "Vanilla, Sandalwood, Patchouli", [
    ["Maison Alhambra", "Bright Peach", 25, 92],
    ["Fragrance World", "Lush Peach", 22, 88]
  ]],
  ["Tom Ford", "Rose Prick", 260, "Sichuan Pepper, Turmeric", "May Rose, Bulgarian Rose", "Patchouli, Tonka Bean", [
    ["Maison Alhambra", "Rose Petals", 25, 90],
    ["Fragrance World", "Rose Seduction", 22, 85]
  ]],
  ["Tom Ford", "Ombre Leather", 160, "Cardamom", "Leather, Jasmine Sambac", "Amber, Moss, Patchouli", [
    ["Maison Alhambra", "Amber & Leather", 25, 95],
    ["Afnan", "Rare Carbon", 45, 92],
    ["Cremo", "Vintage Suede", 25, 80]
  ]],
  // DIOR
  ["Dior", "Miss Dior", 130, "Iris, Peony, Lily-of-the-Valley", "Apricot, Rose, Peach", "Vanilla, Musk, Tonka Bean", [
    ["Lidl", "Suddenly Madame Glamour", 5.99, 95],
    ["Zara", "Applejuice", 15.95, 80]
  ]],
  ["Dior", "Hypnotic Poison", 125, "Coconut, Plum, Apricot", "Brazilian Rosewood, Jasmine, Caraway", "Vanilla, Almond, Sandalwood", [
    ["La Rive", "Sweet Hope", 12, 88],
    ["Zara", "Femme", 15.95, 82]
  ]],
  ["Dior", "Fahrenheit", 110, "Nutmeg Flower, Lavender", "Honeysuckle, Carnation, Sandalwood", "Leather, Vetiver, Musk", [
    ["Mercedes-Benz", "Intense", 40, 85],
    ["La Rive", "Hitfire", 12, 80]
  ]],
  ["Dior", "Homme Intense", 120, "Lavender", "Iris, Ambrette, Pear", "Virginia Cedar, Vetiver", [
    ["Zara", "Night Pour Homme III", 19.95, 82],
    ["Valentino", "Uomo Intense", 100, 85]
  ]],
  // CREED
  ["Creed", "Silver Mountain Water", 260, "Bergamot, Mandarin Orange", "Green Tea, Black Currant", "Musk, Petitgrain, Sandalwood", [
    ["Armaf", "Club de Nuit Sillage", 40, 95],
    ["Al Haramain", "L'Aventure Blanche", 45, 90]
  ]],
  ["Creed", "Millesime Imperial", 260, "Fruity Notes, Sea Salt", "Sicilian Lemon, Bergamot, Iris", "Musk, Woody Notes", [
    ["Armaf", "Club de Nuit Milestone", 40, 95],
    ["Sean John", "Unforgivable", 30, 85]
  ]],
  ["Creed", "Virgin Island Water", 260, "Coconut, Lime, White Bergamot", "Ginger, Ylang-Ylang", "Sugar Cane, White Rum, Musk", [
    ["Tommy Bahama", "Set Sail St. Barts", 25, 80],
    ["Alexandria Fragrances", "Hawaii Volcano", 45, 90]
  ]],
  ["Creed", "Green Irish Tweed", 260, "Lemon, Verbena, Peppermint", "Violet Leaves", "Florentine Iris, Sandalwood", [
    ["Davidoff", "Cool Water", 35, 80],
    ["Armaf", "Tres Nuit", 25, 92],
    ["Al Haramain", "L'Aventure Knight", 45, 88]
  ]],
  // CHANEL
  ["Chanel", "Coco Mademoiselle", 130, "Orange, Mandarin Orange, Bergamot", "Turkish Rose, Jasmine, Ylang-Ylang", "Patchouli, White Musk, Vanilla", [
    ["Lidl", "Suddenly Madame Glamour", 5.99, 95],
    ["Armaf", "Club de Nuit Woman", 30, 92],
    ["Superdrug", "Layering Lab Blossom", 10, 80]
  ]],
  ["Chanel", "Chance Eau Tendre", 115, "Quince, Grapefruit", "Hyacinth, Jasmine", "Musk, Iris, Cedar", [
    ["Zara", "Applejuice", 15.95, 92],
    ["La Rive", "Have Fun", 12, 85]
  ]],
  ["Chanel", "Allure Homme Sport", 110, "Orange, Sea Notes, Aldehydes", "Pepper, Neroli, Cedar", "Tonka Bean, Vanilla, White Musk", [
    ["Versace", "Pour Homme", 60, 85],
    ["Missoni", "Wave", 40, 92]
  ]],
  // MAISON MARGIELA
  ["Maison Margiela", "By the Fireplace", 125, "Cloves, Pink Pepper", "Chestnut, Guaiac Wood, Juniper", "Vanilla, Peru Balsam, Cashmeran", [
    ["Zara", "Bohemian Oud", 22.95, 88],
    ["Lattafa", "Ameer Al Oudh Intense Oud", 25, 95],
    ["Dossier", "Woody Chestnut", 29, 90]
  ]],
  ["Maison Margiela", "Jazz Club", 125, "Pink Pepper, Neroli, Lemon", "Rum, Java Vetiver, Clary Sage", "Tobacco Leaf, Vanilla Bean", [
    ["Zara", "Tobacco Collection Rich Warm Addictive", 19.95, 80],
    ["Dossier", "Woody Tobacco", 29, 90]
  ]],
  // BYREDO
  ["Byredo", "Bal d'Afrique", 195, "Amalfi Lemon, Tagetes, Black Currant", "Violet, Cyclamen, Jasmine", "Vetiver, Amber, Musk", [
    ["Zara", "Warm Freedom", 22.95, 85],
    ["Dossier", "Ambery Vetiver", 39, 88],
    ["Oakcha", "Gold Gem", 40, 90]
  ]],
  ["Byredo", "Mojave Ghost", 195, "Sapodilla, Ambrette", "Magnolia, Violet, Sandalwood", "Ambergris, Cedar", [
    ["Zara", "Waterlily Tea Dress", 22.95, 80],
    ["Dossier", "Floral Pear", 39, 92]
  ]],
  // PARFUMS DE MARLY
  ["Parfums de Marly", "Pegasus", 225, "Heliotrope, Cumin, Bergamot", "Bitter Almond, Lavender, Jasmine", "Vanilla, Sandalwood, Amber", [
    ["Armaf", "Craze", 30, 95],
    ["Al Haramain", "Detour Rouge", 40, 88]
  ]],
  ["Parfums de Marly", "Herod", 225, "Cinnamon, Pepper", "Tobacco Leaf, Incense, Osmanthus", "Vanilla, Musk, Cedar", [
    ["Maison Alhambra", "Hercules", 25, 90],
    ["Essential Parfums", "Divine Vanille", 75, 85]
  ]],
  // VALENTINO
  ["Valentino", "Donna Born In Roma", 125, "Black Currant, Pink Pepper", "Jasmine, Jasmine Tea", "Bourbon Vanilla, Cashmeran", [
    ["Zara", "Pink Flambe", 15.95, 85],
    ["La Rive", "Destinee", 12, 88]
  ]],
  // JEAN PAUL GAULTIER
  ["Jean Paul Gaultier", "Le Male", 95, "Lavender, Mint, Cardamom", "Cinnamon, Orange Blossom, Caraway", "Vanilla, Tonka Bean, Amber", [
    ["Cuba", "Gold", 10, 85],
    ["Milton Lloyd", "Bondage Homme", 6, 80]
  ]],
  ["Jean Paul Gaultier", "Scandal", 100, "Blood Orange, Mandarin Orange", "Honey, Gardenia, Orange Blossom", "Patchouli, Beeswax, Caramel", [
    ["La Rive", "Give Me Love", 12, 88],
    ["Zara", "Gourmand Addict", 15.95, 82]
  ]],
  ["Jean Paul Gaultier", "Ultra Male", 100, "Pear, Lavender, Mint", "Cinnamon, Clary Sage, Caraway", "Black Vanilla Husk, Amber, Cedar", [
    ["Afnan", "9pm", 35, 95],
    ["Zara", "Gourmand Leather", 19.95, 85]
  ]],
  // YVES SAINT LAURENT
  ["Yves Saint Laurent", "Y Eau de Parfum", 115, "Apple, Ginger, Bergamot", "Sage, Juniper Berries, Geranium", "Amberwood, Tonka Bean, Cedar", [
    ["Lattafa", "Fakhar Black", 25, 90],
    ["Zara", "London", 19.95, 80]
  ]],
  ["Yves Saint Laurent", "Tuxedo", 250, "Violet Leaf, Coriander", "Rose, Black Pepper, Lily-of-the-Valley", "Patchouli, Ambergris, Bourbon Vanilla", [
    ["Maison Alhambra", "The Tux", 30, 95],
    ["Rochas", "Moustache Eau de Parfum", 45, 90]
  ]],
  // ROJA PARFUMS
  ["Roja Parfums", "Elysium", 295, "Grapefruit, Lemon, Galbanum", "Vetiver, Juniper Berries, Black Currant", "Ambergris, Leather, Vanilla", [
    ["Fragrance World", "Imperium", 25, 90],
    ["Zion", "Alexandria Fragrances", 45, 88],
    ["Armaf", "Club de Nuit Blue Iconic", 45, 80]
  ]],
  // INITIO
  ["Initio", "Oud for Greatness", 330, "Saffron, Nutmeg, Lavender", "Agarwood (Oud)", "Patchouli, Musk", [
    ["Lattafa", "Bade'e Al Oud Oud for Glory", 35, 95],
    ["Maison Alhambra", "Infini Oud", 30, 90]
  ]],
  // VERSACE
  ["Versace", "Eros", 90, "Mint, Green Apple, Lemon", "Tonka Bean, Ambroxan, Geranium", "Madagascar Vanilla, Virginian Cedar, Vetiver", [
    ["Guess", "1981 Los Angeles Men", 25, 85],
    ["Zara", "Seoul", 15.95, 80]
  ]],
  ["Versace", "Crystal Noir", 95, "Pepper, Ginger, Cardamom", "Coconut, Gardenia, Orange Blossom", "Sandalwood, Musk, Amber", [
    ["La Rive", "Night Impression", 12, 85]
  ]],
  // GIORGIO ARMANI
  ["Giorgio Armani", "Si", 105, "Cassis", "May Rose, Freesia", "Vanilla, Patchouli, Ambroxan", [
    ["La Rive", "In Woman", 12, 90],
    ["Zara", "Fruity", 15.95, 80]
  ]],
  ["Giorgio Armani", "Armani Code", 100, "Lemon, Bergamot", "Star Anise, Olive Blossom, Guaiac Wood", "Leather, Tonka Bean, Tobacco", [
    ["La Rive", "Black Creek", 12, 85],
    ["Zara", "Black Tag", 19.95, 80]
  ]],
  ["Giorgio Armani", "Stronger With You", 90, "Cardamom, Pink Pepper, Violet Leaf", "Pineapple, Sage, Melon", "Vanilla, Chestnut, Cedar", [
    ["Lattafa", "Khamrah", 35, 80],
    ["Maison Alhambra", "Your Touch", 25, 95]
  ]],
  // MUGLER
  ["Mugler", "Angel", 100, "Cotton Candy, Coconut, Cassis", "Honey, Red Berries, Blackberry", "Patchouli, Chocolate, Caramel", [
    ["La Rive", "River of Love", 12, 88],
    ["Milton Lloyd", "Spirit of Heaven", 6, 85]
  ]],
  // LANCÔME
  ["Lancôme", "La Vie Est Belle", 105, "Black Currant, Pear", "Iris, Jasmine, Orange Blossom", "Praline, Vanilla, Patchouli", [
    ["La Rive", "Queen of Life", 12, 95],
    ["Zara", "Red Vanilla", 15.95, 90],
    ["Aldi", "Lacura Je Suis Belle", 6.99, 88]
  ]],
  // MARC JACOBS
  ["Marc Jacobs", "Daisy", 90, "Violet Leaf, Blood Grapefruit, Strawberry", "Violet, Gardenia, Jasmine", "Musk, White Woods, Vanilla", [
    ["Zara", "Applejuice", 15.95, 80],
    ["La Rive", "Eve", 12, 85]
  ]],
  ["Marc Jacobs", "Perfect", 100, "Rhubarb, Daffodil", "Almond Milk", "Cashmeran, Cedar", [
    ["Zara", "Wonder Rose", 15.95, 85]
  ]],
  // NARCISO RODRIGUEZ
  ["Narciso Rodriguez", "For Her", 100, "African Orange Flower, Osmanthus", "Musk, Amber", "Vetiver, Vanilla, Patchouli", [
    ["Zara", "Bright Rose", 15.95, 90]
  ]],
  // GIVENCHY
  ["Givenchy", "L'Interdit", 110, "Pear, Bergamot", "Tuberose, Orange Blossom, Jasmine", "Patchouli, Vanilla, Ambroxan", [
    ["Zara", "Tubereuse Noir", 22.95, 85],
    ["Maison Alhambra", "L'Intense", 25, 90]
  ]],
  // PENHALIGON'S
  ["Penhaligon's", "Halfeti", 215, "Cypress, Saffron, Cardamom", "Bulgarian Rose, Nutmeg, Jasmine", "Agarwood (Oud), Leather, Cedar", [
    ["Lattafa", "Oud Najdia", 20, 80],
    ["Fragrance World", "Halfeti Leather", 30, 90]
  ]]
];

const catalog = [];

for (const data of rawData) {
  const orig = {
    name: data[1],
    brand: data[0],
    price: data[2],
    notes: `${data[3]} | ${data[4]} | ${data[5]}`,
    
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
  };
  
  const dupes = data[6].map(d => ({
    brand: d[0],
    name: d[1],
    price: d[2],
    similarity_match: d[3],
    notes: `Inspired by ${data[1]}`,
    
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
  }));
  
  catalog.push({ original: orig, dupes: dupes });
}

fs.writeFileSync('catalog_seed2.json', JSON.stringify(catalog, null, 2));
console.log(`Generated ${catalog.length} originals and ${catalog.reduce((acc, curr) => acc + curr.dupes.length, 0)} dupes.`);
