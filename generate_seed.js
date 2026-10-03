import fs from 'fs';

// Compact format: [OriginalBrand, OriginalName, OrigPrice, Top, Heart, Base, DupesArray]
// DupesArray format: [[DupeBrand, DupeName, DupePrice, MatchScore], ...]
const rawData = [
  // BACCARAT ROUGE 540
  ["Maison Francis Kurkdjian", "Baccarat Rouge 540", 250, "Saffron, Jasmine", "Amberwood, Ambergris", "Fir Resin, Cedar", [
    ["Armaf", "Club de Nuit Untold", 58, 95],
    ["Zara", "Red Temptation", 22.95, 88],
    ["Ariana Grande", "Cloud", 35, 85],
    ["Lattafa", "Ana Abiyedh Rouge", 20, 92],
    ["Maison Alhambra", "Baroque Rouge 540", 25, 90]
  ]],
  // AVENTUS
  ["Creel", "Aventus", 295, "Pineapple, Bergamot, Black Currant", "Birch, Patchouli, Moroccan Jasmine", "Musk, Oak moss, Ambergris", [
    ["Armaf", "Club de Nuit Intense Man", 35, 95],
    ["Zara", "Vibrant Leather", 22.95, 85],
    ["Lattafa", "Qaed Al Fursan", 20, 88],
    ["Afnan", "Supremacy Silver", 45, 92],
    ["Montblanc", "Explorer", 40, 89]
  ]],
  // DELINA
  ["Parfums de Marly", "Delina", 245, "Litchi, Rhubarb, Bergamot", "Turkish Rose, Peony, Musk", "Cashmeran, Cedar, Incense", [
    ["Zara", "Fashionably London", 22.95, 85],
    ["Armaf", "Club de Nuit Imperiale", 45, 92],
    ["Maison Alhambra", "Delilah", 25, 90],
    ["Afnan", "Souvenir Floral Bouquet", 35, 88]
  ]],
  // ANGELS SHARE
  ["Kilian", "Angels Share", 210, "Cognac", "Cinnamon, Tonka Bean, Oak", "Praline, Vanilla, Sandalwood", [
    ["Lattafa", "Khamrah", 35, 90],
    ["Maison Alhambra", "Kismet Angel", 25, 95],
    ["Zara", "Sand Desert at Sunset", 22.95, 85],
    ["Fragrance World", "Cocktail Intense", 20, 92]
  ]],
  // TOBACCO VANILLE
  ["Tom Ford", "Tobacco Vanille", 240, "Tobacco Leaf, Spicy Notes", "Vanilla, Cacao, Tonka Bean", "Dried Fruits, Woody Notes", [
    ["Maison Alhambra", "Tobacco Touch", 25, 93],
    ["Zara", "Warm Black", 15.95, 80],
    ["Al Haramain", "Amber Oud Tobacco Edition", 60, 95],
    ["Fragrance World", "Vanilla So Sweet", 20, 88]
  ]],
  // OUD WOOD
  ["Tom Ford", "Oud Wood", 240, "Rosewood, Cardamom, Chinese Pepper", "Oud, Sandalwood, Vetiver", "Tonka Bean, Vanilla, Amber", [
    ["Maison Alhambra", "Woody Oud", 25, 92],
    ["Zara", "Ebony Wood", 22.95, 82],
    ["Versace", "Oud Noir", 80, 85]
  ]],
  // LOST CHERRY
  ["Tom Ford", "Lost Cherry", 260, "Sour Cherry, Bitter Almond", "Plum, Turkish Rose, Jasmine", "Tonka Bean, Vanilla, Peru Balsam", [
    ["Maison Alhambra", "Lovely Cherie", 25, 90],
    ["Zara", "Cherry Smoothie", 22.95, 85],
    ["Fragrance World", "Lush Cherry", 22, 88]
  ]],
  // BLACK OPIUM
  ["Yves Saint Laurent", "Black Opium", 110, "Pear, Pink Pepper, Orange Blossom", "Coffee, Jasmine, Bitter Almond", "Vanilla, Patchouli, Cashmere Wood", [
    ["Zara", "Gardenia", 15.95, 90],
    ["Superdrug", "Layering Lab Midnight", 10, 85],
    ["Maison Alhambra", "Opera Noir", 20, 92]
  ]],
  // LIBRE
  ["Yves Saint Laurent", "Libre", 110, "Lavender, Mandarin Orange, Black Currant", "Lavender, Orange Blossom, Jasmine", "Madagascar Vanilla, Musk, Cedar", [
    ["Zara", "Golden Decade", 22.95, 95],
    ["Maison Alhambra", "Leon", 20, 90]
  ]],
  // SAUVAGE
  ["Dior", "Sauvage", 120, "Calabrian bergamot, Pepper", "Sichuan Pepper, Lavender, Pink Pepper", "Ambroxan, Cedar, Labdanum", [
    ["Armaf", "Ventana Pour Homme", 25, 88],
    ["Afnan", "Modest Une", 35, 92],
    ["Zara", "Aromatic Future", 15.95, 85],
    ["La Rive", "Extreme Story", 10, 80]
  ]],
  // ALIEN
  ["Mugler", "Alien", 100, "Jasmine", "Woody Notes", "Amber", [
    ["Zara", "Violet Blossom", 15.95, 85],
    ["Superdrug", "Layering Lab Blossom", 10, 80],
    ["La Rive", "Fleur de Femme", 12, 82]
  ]],
  // GOOD GIRL
  ["Carolina Herrera", "Good Girl", 115, "Almond, Coffee, Bergamot", "Tuberose, Jasmine Sambac, Orange Blossom", "Tonka Bean, Cacao, Vanilla", [
    ["Zara", "Deep Garden", 15.95, 85],
    ["M&S", "Midnight Blossom", 15, 82],
    ["Maison Alhambra", "Bad Femme", 20, 90]
  ]],
  // GYPSY WATER
  ["Byredo", "Gypsy Water", 195, "Bergamot, Lemon, Pepper, Juniper", "Incense, Pine Needles, Orris", "Amber, Vanilla, Sandalwood", [
    ["Zara", "Waterlily Tea Dress", 22.95, 82],
    ["Oakcha", "Morning Rain", 40, 90],
    ["Dossier", "Woody Sandalwood", 39, 88]
  ]],
  // SANTAL 33
  ["Le Labo", "Santal 33", 215, "Cardamom, Iris, Violet", "Sandalwood, Papyrus, Cedar", "Leather, Amber, Iris", [
    ["Zara", "Energetically New York", 22.95, 85],
    ["Maison Crivelli", "Santal Volcanique", 180, 80],
    ["Dossier", "Woody Sandalwood", 39, 90]
  ]],
  // PORTRAIT OF A LADY
  ["Frederic Malle", "Portrait of a Lady", 280, "Rose, Clove, Raspberry", "Patchouli, Incense, Sandalwood", "Musk, Amber", [
    ["Zara", "Rose Petal Drops", 22.95, 80],
    ["Afnan", "Supremacy Incense", 45, 85]
  ]],
  // LAYTON
  ["Parfums de Marly", "Layton", 225, "Apple, Lavender, Bergamot", "Geranium, Violet, Jasmine", "Vanilla, Cardamom, Sandalwood", [
    ["Lalique", "White in Black", 50, 88],
    ["Al Haramain", "Detour Noir", 35, 95],
    ["Maison Alhambra", "Leyden", 25, 92]
  ]],
  // ERBA PURA
  ["Xerjoff", "Erba Pura", 230, "Sicilian Orange, Calabrian bergamot", "Fruits", "White Musk, Madagascar Vanilla, Amber", [
    ["Lattafa", "Ana Abiyedh", 20, 88],
    ["Al Haramain", "Amber Oud Gold Edition", 60, 95],
    ["Armaf", "Club de Nuit Untold", 58, 80]
  ]],
  // BUBBLE BATH
  ["Maison Margiela", "Bubble Bath", 125, "Soap, Bergamot", "Lavender, Rose, Jasmine", "Coconut, White Musk, Patchouli", [
    ["Zara", "A Perfume in Rose", 22.95, 82]
  ]],
  // J'ADORE
  ["Dior", "J'adore", 130, "Pear, Melon, Magnolia", "Jasmine, Lily-of-the-Valley, Tuberose", "Musk, Vanilla, Blackberry", [
    ["Zara", "Rose", 15.95, 85],
    ["La Rive", "In Woman", 12, 80],
    ["Superdrug", "Artiscent Atelier Spring Muget", 15, 82]
  ]],
  // 1 MILLION
  ["Paco Rabanne", "1 Million", 95, "Blood Mandarin, Grapefruit, Mint", "Cinnamon, Spicy Notes, Rose", "Amber, Leather, Woody Notes", [
    ["Zara", "Uomo", 15.95, 85],
    ["Armaf", "Club de Nuit Man", 30, 88],
    ["La Rive", "Cash", 12, 80]
  ]],
  // BLEU DE CHANEL
  ["Chanel", "Bleu de Chanel", 120, "Grapefruit, Lemon, Mint", "Ginger, Nutmeg, Jasmine", "Incense, Vetiver, Cedar", [
    ["Armaf", "Club de Nuit Iconic", 45, 92],
    ["Zara", "Navy Black", 15.95, 82],
    ["Missoni", "Pour Homme", 40, 85]
  ]],
  // CHLOE
  ["Chloe", "Chloe Eau de Parfum", 110, "Peony, Litchi, Freesia", "Rose, Lily-of-the-Valley, Magnolia", "Virginia Cedar, Amber", [
    ["Zara", "Powdery Magnolia", 15.95, 88],
    ["La Rive", "Cuté", 12, 85]
  ]],
  // LIGHT BLUE
  ["Dolce & Gabbana", "Light Blue", 90, "Sicilian Lemon, Apple, Cedar", "Bamboo, Jasmine, White Rose", "Cedar, Musk, Amber", [
    ["Zara", "Applejuice", 15.95, 90],
    ["Moschino", "I Love Love", 40, 85]
  ]],
  // AQUA DI GIO
  ["Giorgio Armani", "Acqua Di Gio", 95, "Lime, Lemon, Bergamot", "Sea Notes, Jasmine, Calone", "White Musk, Cedar, Oakmoss", [
    ["Zara", "Lisboa", 15.95, 85],
    ["Perry Ellis", "360 Red for Men", 30, 90],
    ["Armaf", "Blue Homme", 25, 88]
  ]],
  // OLYMPEA
  ["Paco Rabanne", "Olympea", 95, "Water Jasmine, Green Mandarin", "Vanilla, Salt", "Cashmere Wood, Ambergris", [
    ["Zara", "Fields at Nightfall", 22.95, 88],
    ["La Rive", "In Flames", 12, 85],
    ["Superdrug", "Layering Lab Paradise", 10, 82]
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

fs.writeFileSync('catalog_seed.json', JSON.stringify(catalog, null, 2));
console.log(`Generated ${catalog.length} originals and ${catalog.reduce((acc, curr) => acc + curr.dupes.length, 0)} dupes.`);
