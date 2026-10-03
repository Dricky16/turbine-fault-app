import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add region state
const stateTarget = `const [loading, setLoading] = useState(false);`;
const stateRep = `const [loading, setLoading] = useState(false);\n  const [region, setRegion] = useState('IE'); // 'IE' or 'UK'`;
content = content.replace(stateTarget, stateRep);

// Update nav to include region toggle
const navTarget = `{session ? (`;
const navRep = `
          {/* Region Toggle */}
          <div className="flex bg-luxury-100 rounded-full p-1 mr-2 border border-luxury-200">
            <button 
              onClick={() => setRegion('IE')}
              className={\`px-3 py-1 rounded-full text-xs font-bold transition-colors \${region === 'IE' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}\`}
            >
              🇮🇪 IE
            </button>
            <button 
              onClick={() => setRegion('UK')}
              className={\`px-3 py-1 rounded-full text-xs font-bold transition-colors \${region === 'UK' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}\`}
            >
              🇬🇧 UK
            </button>
          </div>
          {session ? (`;
content = content.replace(navTarget, navRep);

// Update dupe card rendering to use region
const dupeCardTarget = `€{dupe.price?.toFixed(2) || '15.00'}`;
const dupeCardRep = `{region === 'UK' ? '£' : '€'}{region === 'UK' ? (dupe.price_gbp?.toFixed(2) || (dupe.price * 0.85).toFixed(2)) : (dupe.price?.toFixed(2) || '15.00')}`;
content = content.replace(dupeCardTarget, dupeCardRep);

// Update dupe card affiliate link
const dupeHrefTarget = `href={dupe.affiliate_link || '#'}`;
const dupeHrefRep = `href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || '#'}`;
content = content.replace(dupeHrefTarget, dupeHrefRep);

// Update original perfume rendering
const origPriceTarget = `€{original.price?.toFixed(2) || '95.00'}`;
const origPriceRep = `{region === 'UK' ? '£' : '€'}{region === 'UK' ? (original.price_gbp?.toFixed(2) || (original.price * 0.85).toFixed(2)) : (original.price?.toFixed(2) || '95.00')}`;
content = content.replace(origPriceTarget, origPriceRep);

// Add geolocation logic inside useEffect
const effectTarget = `// Check if we just returned from a successful Stripe checkout`;
const effectRep = `// Auto-detect region
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'GB') {
          setRegion('UK');
        }
      })
      .catch(err => console.log('Geolocation skipped'));

    // Check if we just returned from a successful Stripe checkout`;
content = content.replace(effectTarget, effectRep);

fs.writeFileSync('src/App.jsx', content);
