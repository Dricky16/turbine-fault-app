import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Imports
code = code.replace(
  "import CameraScanner from './CameraScanner';",
  "import CameraScanner from './CameraScanner';\nimport RequestModal from './RequestModal';\nimport { Filter } from 'lucide-react';"
);

// 2. States
code = code.replace(
  "const [profile, setProfile] = useState(null);",
  "const [profile, setProfile] = useState(null);\n  const [showRequestModal, setShowRequestModal] = useState(false);\n  const [sortMode, setSortMode] = useState('name-asc');"
);

// 3. sortedPerfumes logic (put it right before the render)
code = code.replace(
  "return (",
  `const sortedPerfumes = [...allPerfumes].sort((a, b) => {
    if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
    if (sortMode === 'brand-asc') return a.brand.localeCompare(b.brand);
    if (sortMode === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortMode === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });\n\n  return (`
);

// 4. Update the Request Modal at the top of the render
code = code.replace(
  "<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />",
  "<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />\n      <RequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />"
);

// 5. Update the "Available Fragrances" header to include the dropdown and the Request button
code = code.replace(
  "<h3 className=\"font-serif text-2xl text-luxury-900 font-semibold mb-6 text-center\">Available Fragrances</h3>",
  `<div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-luxury-200">
                <h3 className="font-serif text-3xl text-luxury-900 font-bold mb-4 sm:mb-0">Available Scents</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value)}
                      className="appearance-none bg-white border border-luxury-200 text-luxury-800 py-2.5 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer"
                    >
                      <option value="name-asc">A-Z (Name)</option>
                      <option value="brand-asc">A-Z (Brand)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 pointer-events-none" size={16} />
                  </div>
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="bg-luxury-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gold transition-colors shadow-sm whitespace-nowrap"
                  >
                    Request Scent
                  </button>
                </div>
              </div>`
);

// 6. Update the map to use sortedPerfumes
code = code.replace(
  "allPerfumes.slice(0, visibleCount).map((perfume) =>",
  "sortedPerfumes.slice(0, visibleCount).map((perfume) =>"
);

// 7. Update the See More conditional
code = code.replace(
  "{visibleCount < allPerfumes.length && (",
  "{visibleCount < sortedPerfumes.length && ("
);

fs.writeFileSync('src/App.jsx', code);
console.log("App.jsx patched successfully!");
