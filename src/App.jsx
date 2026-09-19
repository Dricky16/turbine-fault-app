import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ShieldCheck, Percent, Tag } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [original, setOriginal] = useState(null);
  const [dupes, setDupes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Currency state
  const [currency, setCurrency] = useState({ symbol: '€', code: 'EUR', rate: 1 });

  // Detect location and set currency on load
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'GB') {
          // If in the UK, switch to GBP and apply approximate exchange rate (EUR to GBP)
          setCurrency({ symbol: '£', code: 'GBP', rate: 0.85 });
        } else if (data.country_code === 'US') {
          // If in the US, switch to USD
          setCurrency({ symbol: '$', code: 'USD', rate: 1.08 });
        }
        // Defaults to EUR (rate 1) for Ireland and others
      })
      .catch(err => console.error("GeoIP Error:", err));
  }, []);

  const formatPrice = (price) => {
    return currency.symbol + (parseFloat(price) * currency.rate).toFixed(2);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setOriginal(null);
    setDupes([]);

    try {
      // 1. Search for the original perfume
      const { data: perfumeData, error: perfumeError } = await supabase
        .from('perfumes')
        .select('*')
        .ilike('name', `%${searchTerm.trim()}%`)
        .single();

      if (perfumeError) {
        if (perfumeError.code === 'PGRST116') {
          // Not found
          setOriginal(null);
        } else {
          throw perfumeError;
        }
      } else {
        setOriginal(perfumeData);
        
        // 2. If found, fetch its dupes
        const { data: dupesData, error: dupesError } = await supabase
          .from('dupes')
          .select('*')
          .eq('original_id', perfumeData.id)
          .order('similarity_match', { ascending: false });
          
        if (dupesError) throw dupesError;
        setDupes(dupesData || []);
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraClick = () => {
    // Placeholder for Premium Camera Feature
    alert("Camera Scan Feature coming soon! (Premium Only)");
  };

  return (
    <div className="min-h-screen bg-luxury-50 text-luxury-950 font-sans selection:bg-gold-light selection:text-luxury-950">
      
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="text-gold" size={24} />
          <span className="font-serif font-bold text-2xl tracking-tight text-luxury-900">Scents for Cents</span>
        </div>
        <button className="text-sm font-medium text-luxury-700 hover:text-luxury-900 transition-colors">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center pt-16 pb-24 px-4 max-w-5xl mx-auto">
        
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="font-serif text-5xl md:text-6xl text-luxury-900 mb-6 leading-tight">
            Luxury Fragrances, <br/>
            <span className="italic text-gold-dark">Without the Premium Price.</span>
          </h1>
          <p className="text-luxury-700 text-lg md:text-xl font-light">
            Search for your favorite high-end designer perfume, and we'll reveal the closest, most affordable clones and dupes.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-4">
          <div className="relative flex items-center shadow-sm rounded-full overflow-hidden border border-luxury-200 bg-white focus-within:ring-2 focus-within:ring-gold focus-within:border-gold transition-all">
            <div className="pl-6 text-luxury-400">
              <Search size={24} />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Baccarat Rouge 540"
              className="w-full text-lg py-5 pl-4 pr-16 focus:outline-none bg-transparent placeholder:text-luxury-300 font-medium"
            />
            {/* Premium Camera Button inside Search */}
            <button 
              type="button"
              onClick={handleCameraClick}
              className="absolute right-2 p-3 text-luxury-400 hover:text-gold hover:bg-luxury-50 rounded-full transition-colors flex items-center group tooltip-trigger"
              title="Scan a bottle (Premium)"
            >
              <Camera size={24} />
            </button>
          </div>
        </form>
        <p className="text-sm text-luxury-400 mb-16">Try searching: "Baccarat Rouge 540"</p>

        {/* Results Area */}
        <div className="w-full max-w-4xl">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-luxury-200 border-t-gold rounded-full animate-spin mb-4"></div>
              <p className="text-luxury-600 font-medium animate-pulse">Finding the perfect match...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-800">
              {error}
            </div>
          )}

          {hasSearched && !loading && !error && !original && (
            <div className="bg-white border border-luxury-200 rounded-3xl p-12 text-center shadow-sm">
              <h2 className="font-serif text-2xl text-luxury-900 mb-2">We couldn't find that perfume.</h2>
              <p className="text-luxury-600 mb-6">Our database is growing every day. Try searching for another popular fragrance.</p>
              <button 
                onClick={handleCameraClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-900 text-white rounded-full font-medium hover:bg-luxury-800 transition-colors"
              >
                <Camera size={20} />
                Try Scanning a Bottle
              </button>
            </div>
          )}

          {hasSearched && !loading && !error && original && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Original Perfume Header */}
              <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-luxury-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="w-32 h-32 bg-luxury-50 rounded-2xl border border-luxury-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                   {original.image_url ? (
                     <img src={original.image_url} alt={original.name} className="w-full h-full object-cover" />
                   ) : (
                     <Sparkles className="text-luxury-300" size={40} />
                   )}
                </div>
                <div className="text-center sm:text-left flex-1 w-full">
                  <div className="inline-block px-3 py-1 bg-luxury-100 text-luxury-700 text-xs font-bold tracking-wider uppercase rounded-full mb-3">Original</div>
                  <h2 className="font-serif text-3xl font-bold text-luxury-900 mb-1">{original.name}</h2>
                  <p className="text-luxury-600 text-lg mb-4">by {original.brand}</p>
                  <p className="text-2xl text-luxury-900 font-semibold mb-4">{formatPrice(original.price)} <span className="text-sm font-normal text-luxury-400">Retail</span></p>
                </div>
                
                {/* Original Buy Button */}
                <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-luxury-100 w-full sm:w-auto pt-6 sm:pt-0 sm:pl-8">
                  {original.affiliate_link && (
                    <a 
                      href={original.affiliate_link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white border-2 border-luxury-900 text-luxury-900 hover:bg-luxury-50 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                    >
                      Buy Original <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Dupes List */}
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-serif text-2xl font-semibold text-luxury-900">Closest Matches ({dupes.length})</h3>
              </div>

              {dupes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-luxury-100">
                  <p className="text-luxury-500">We don't have any dupes recorded for this yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dupes.map((dupe, index) => (
                    <div key={dupe.id} className="group bg-white hover:bg-luxury-50 border border-luxury-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row gap-6 items-center sm:items-stretch relative overflow-hidden">
                      
                      {/* Top Match Badge */}
                      {index === 0 && (
                        <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">Top Match</div>
                      )}

                      {/* Dupe Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-luxury-50 rounded-xl border border-luxury-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                         {dupe.image_url ? (
                           <img src={dupe.image_url} alt={dupe.name} className="w-full h-full object-cover" />
                         ) : (
                           <Sparkles className="text-luxury-300" size={32} />
                         )}
                      </div>

                      <div className="flex-1 text-center sm:text-left w-full">
                        <h4 className="text-xl font-bold text-luxury-900 mb-1">{dupe.name}</h4>
                        <p className="text-luxury-600 mb-4">by {dupe.brand}</p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                          {/* Similarity Badge */}
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-green-100">
                            <ShieldCheck size={16} />
                            {dupe.similarity_match}% Match
                          </div>
                          
                          {/* Savings Badge */}
                          <div className="flex items-center gap-1.5 bg-luxury-100 text-luxury-800 px-3 py-1.5 rounded-lg text-sm font-semibold border border-luxury-200">
                            <Tag size={16} />
                            Save {formatPrice(parseFloat(original.price) - parseFloat(dupe.price))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-luxury-100 w-full sm:w-auto pt-6 sm:pt-0 sm:pl-8">
                        <div className="text-3xl font-bold text-luxury-900 mb-3">
                          {formatPrice(dupe.price)}
                        </div>
                        <a 
                          href={dupe.affiliate_link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                        >
                          Buy Dupe <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
