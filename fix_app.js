import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Remove it from where it is
code = code.replace(
  `const sortedPerfumes = [...allPerfumes].sort((a, b) => {
    if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
    if (sortMode === 'brand-asc') return a.brand.localeCompare(b.brand);
    if (sortMode === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortMode === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });\n\n  return ()`,
  "return ()"
);

// 2. Put it in the right place! Right before `<div className="min-h-screen`
code = code.replace(
  `  return (
    <div className="min-h-screen`,
  `  const sortedPerfumes = [...allPerfumes].sort((a, b) => {
    if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
    if (sortMode === 'brand-asc') return a.brand.localeCompare(b.brand);
    if (sortMode === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortMode === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  return (
    <div className="min-h-screen`
);

fs.writeFileSync('src/App.jsx', code);
console.log("Fixed!");
