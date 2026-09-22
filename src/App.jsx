import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ShieldCheck, Percent, Tag } from 'lucide-react';
import { supabase } from './supabaseClient';
import CameraScanner from './CameraScanner';
import { GoogleGenAI } from '@google/genai';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [original, setOriginal] = useState(null);
  const [dupes, setDupes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPerfumes, setAllPerfumes] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  
  // Currency state
  const [currency, setCurrency] = useState({ symbol: '€', code: 'EUR', rate: 1 });

  // Detect location and set currency on load
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'GB') {
          setCurrency({ symbol: '£', code: 'GBP', rate: 0.85 });
        } else if (data.country_code === 'US') {
          setCurrency({ symbol: '$', code: 'USD', rate: 1.08 });
        }
      })
      .catch(err => console.error("GeoIP Error:", err));
      
    // Fetch all premium perfumes for the home screen
    const fetchPerfumes = async () => {
      const { data } = await supabase
        .from('perfumes')
        .select('*')
        .order('name', { ascending: true });
      if (data) setAllPerfumes(data);
    };
    fetchPerfumes();
  }, []);

  const [visibleCount, setVisibleCount] = useState(15);

  const formatPrice = (price) => {
    return currency.symbol + (parseFloat(price) * currency.rate).toFixed(2);
  };

  const executeSearch = async (term) => {
    if (!term.trim()) return;
    
    setSearchTerm(term);
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setOriginal(null);
    setDupes([]);

    try {
      let targetOriginalId = null;

      // 1. First, try searching the 'perfumes' table (Originals) by name OR brand
      const { data: perfumeData, error: perfumeError } = await supabase
        .from('perfumes')
        .select('id')
        .or(`name.ilike.%${term.trim()}%,brand.ilike.%${term.trim()}%`)
        .limit(1)
        .maybeSingle();

      if (perfumeData) {
        targetOriginalId = perfumeData.id;
      } else {
        // 2. If not found in originals, search the 'dupes' table by name OR brand
        const { data: dupeData, error: dupeError } = await supabase
          .from('dupes')
          .select('original_id')
          .or(`name.ilike.%${term.trim()}%,brand.ilike.%${term.trim()}%`)
          .limit(1)
          .maybeSingle();
          
        if (dupeData) {
          targetOriginalId = dupeData.original_id;
        }
      }

      // 3. If we found a matching ID, fetch the full data
      if (targetOriginalId) {
        const { data: finalOriginal } = await supabase
          .from('perfumes')
          .select('*')
          .eq('id', targetOriginalId)
          .single();
          
        setOriginal(finalOriginal);
        
        const { data: finalDupes } = await supabase
          .from('dupes')
          .select('*')
          .eq('original_id', targetOriginalId)
          .order('similarity_match', { ascending: false });
          
        setDupes(finalDupes || []);
      } else {
        // Nothing found at all
        setOriginal(null);
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const handleCameraClick = () => {
    setShowCamera(true);
  };

  const handleCapture = async (imageData) => {
    setShowCamera(false);
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setOriginal(null);
    setDupes([]);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it to your .env.local file.");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });

      // Convert base64 data URL (data:image/jpeg;base64,...) to raw base64 string
      const base64Data = imageData.split(',')[1];

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: "Analyze this image of a perfume bottle. What is the exact brand name and the perfume name? Respond ONLY with the name of the perfume. For example, if it is 'Chanel No 5', respond with exactly 'Chanel No 5'. Do not include the brand name unless it is part of the fragrance name. If you absolutely cannot identify it, respond with 'UNKNOWN'."
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ]
        });
      } catch (primaryErr) {
        console.warn("Primary model failed, attempting fallback...", primaryErr);
        // Fallback to older stable model if the new one is too busy
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: "Analyze this image of a perfume bottle. What is the exact brand name and the perfume name? Respond ONLY with the name of the perfume. For example, if it is 'Chanel No 5', respond with exactly 'Chanel No 5'. Do not include the brand name unless it is part of the fragrance name. If you absolutely cannot identify it, respond with 'UNKNOWN'."
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ]
        });
      }

      const identifiedName = response.text.trim();
      
      if (identifiedName === 'UNKNOWN') {
        setError("Could not clearly identify the perfume. Please try taking a clearer photo.");
        setLoading(false);
        return;
      }

      console.log("Identified perfume:", identifiedName);
      
      // Execute the normal search flow using the AI's answer
      await executeSearch(identifiedName);

    } catch (err) {
      console.error("AI processing error:", err);
      let errorMessage = "An error occurred while analyzing the image. Please try again.";
      
      // Try to parse raw JSON errors from the API
      try {
        if (err.message && err.message.includes('{')) {
          const jsonError = JSON.parse(err.message.substring(err.message.indexOf('{')));
          if (jsonError.error && jsonError.error.message) {
            errorMessage = jsonError.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
        errorMessage = "Google's AI servers are currently experiencing very high demand. Please wait a few seconds and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-50 text-luxury-950 font-sans selection:bg-gold-light selection:text-luxury-950">
      {showCamera && (
        <CameraScanner 
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}
      
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo icon kept small in corner, title moved to center */}
          <Sparkles className="text-gold" size={24} />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-luxury-700 hover:text-luxury-900 transition-colors hidden sm:block">
            Sign In
          </button>
          <button 
            onClick={() => alert("To install the app, tap 'Share' then 'Add to Home Screen' on your phone!")}
            className="bg-luxury-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold transition-colors shadow-sm"
          >
            Download App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center pt-4 pb-24 px-4 max-w-5xl mx-auto">
        
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="font-serif text-5xl md:text-6xl text-luxury-900 mb-4 leading-tight flex items-center justify-center gap-4">
            Scents for Cents
          </h1>
          <h2 className="font-serif text-4xl md:text-5xl text-luxury-800 mb-6 leading-tight">
            Luxury Fragrances, <br/>
            <span className="italic text-gold-dark">Without the Premium Price.</span>
          </h2>
          <p className="text-luxury-700 text-lg md:text-xl font-light max-w-2xl mx-auto">
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
          
          {!hasSearched && !loading && (
            <div className="w-full animate-in fade-in duration-500">
              <h3 className="font-serif text-2xl text-luxury-900 font-semibold mb-6 text-center">Available Fragrances</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {allPerfumes.slice(0, visibleCount).map((perfume) => (
                  <div 
                    key={perfume.id} 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      executeSearch(perfume.name);
                    }}
                    className="bg-white border border-luxury-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gold transition-all cursor-pointer text-center flex flex-col items-center justify-between group"
                  >
                    <div className="w-24 h-24 mb-4 bg-luxury-50 rounded-xl border border-luxury-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {perfume.image_url ? (
                        <img src={perfume.image_url} alt={perfume.name} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="text-luxury-300" size={32} />
                      )}
                    </div>
                    <div className="w-full">
                      <h4 className="font-serif text-lg font-bold text-luxury-900 mb-1">{perfume.name}</h4>
                      <p className="text-luxury-600 text-sm mb-4">by {perfume.brand}</p>
                    </div>
                    <div className="text-xl font-semibold text-luxury-900">
                      {formatPrice(perfume.price)}
                    </div>
                  </div>
                ))}
              </div>
              {visibleCount < allPerfumes.length && (
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    className="bg-white border-2 border-luxury-200 text-luxury-800 px-8 py-3 rounded-full font-medium hover:border-gold hover:text-luxury-900 transition-colors"
                  >
                    See More Fragrances
                  </button>
                </div>
              )}
            </div>
          )}

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
                  {original.notes && (
                    <div className="bg-luxury-50 p-4 rounded-xl border border-luxury-100 mt-2">
                      <p className="text-sm text-luxury-800"><span className="font-bold">Notes:</span> {original.notes}</p>
                    </div>
                  )}
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
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3">
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

                        {dupe.notes && (
                          <div className="bg-white p-3 rounded-xl border border-luxury-100 text-left">
                            <p className="text-xs text-luxury-800"><span className="font-bold">Notes:</span> {dupe.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-luxury-100 w-full sm:w-auto pt-6 sm:pt-0 sm:pl-8">
                        <div className="text-3xl font-bold text-luxury-900 mb-3">
                          {formatPrice(dupe.price)}
                        </div>
                        {['Aldi', 'Lidl'].includes(dupe.brand) ? (
                          <div className="w-full flex items-center justify-center gap-2 bg-luxury-100 text-luxury-600 px-6 py-3 rounded-xl font-medium whitespace-nowrap cursor-not-allowed">
                            Available In-Store Only
                          </div>
                        ) : (
                          <a 
                            href={dupe.affiliate_link || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                          >
                            Buy Dupe <ExternalLink size={16} />
                          </a>
                        )}
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
