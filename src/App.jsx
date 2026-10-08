import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ShieldCheck, Percent, Tag, User, Heart } from 'lucide-react';
import AuthModal from './AuthModal';
import PaywallModal from './PaywallModal';
import { supabase } from './supabaseClient';
import CameraScanner from './CameraScanner';
import RequestModal from './RequestModal';
import { Filter } from 'lucide-react';
import LegalModal from './LegalModal';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [original, setOriginal] = useState(null);
  const [dupes, setDupes] = useState([]);
  

  const [searchResultsList, setSearchResultsList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('IE');
  
  const euOnlyBrands = ['lidl', 'aldi', 'jenny glow', 'milton lloyd', 'superdrug', 'la rive'];
  const usOnlyBrands = ['dossier', 'alt fragrances', 'perry ellis'];
  
  const filteredDupes = dupes.filter(dupe => {
    const brand = dupe.brand ? dupe.brand.toLowerCase() : '';
    if (region === 'US') {
      return !euOnlyBrands.some(eu => brand.includes(eu));
    } else {
      return !usOnlyBrands.some(us => brand.includes(us));
    }
  });
  const [legalModalType, setLegalModalType] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // 'IE' or 'UK'
  
  const [favorites, setFavorites] = useState([]);

  // Android/PWA Back Button Handler
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state) {
        if (e.state.view === 'home') {
          setOriginal(null);
          setDupes([]);
          setSearchResultsList([]);
          setHasSearched(false);
          setSearchTerm('');
        } else if (e.state.view === 'search') {
          setOriginal(null);
          setDupes([]);
          // searchResultsList remains active
        }
      } else {
        // Fallback: just clear everything and go home
        setOriginal(null);
        setDupes([]);
        setSearchResultsList([]);
        setHasSearched(false);
        setSearchTerm('');
      }
    };
    
    // Push the initial home state if it doesn't exist
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);



  const getFallbackUrl = (brand, name, region) => {
    // Avoid duplicating brand if it's already in the name
    const searchQuery = name.toLowerCase().includes(brand.toLowerCase()) ? name : `${brand} ${name}`;
    const query = encodeURIComponent(searchQuery);
    const b = brand.toLowerCase();
    
    if (b.includes('zara')) {
      const zaraRegion = region === 'US' ? 'us/en' : (region === 'UK' ? 'uk/en' : 'ie/en');
      return `https://www.zara.com/${zaraRegion}/search.html?searchTerm=${query}`;
    }
    
    if (b.includes('ex nihilo') || b.includes('creed') || b.includes('tom ford') || b.includes('xerjoff') || b.includes('maison margiela') || b.includes('byredo') || b.includes('le labo') || b.includes('dior') || b.includes('chanel') || b.includes('ysl') || b.includes('giorgio armani') || b.includes('paco rabanne') || b.includes('mugler') || b.includes('carolina herrera') || b.includes('marc jacobs') || b.includes('jo malone') || b.includes('roja') || b.includes('parfums de marly')) {
       if (region === 'US') return `https://www.saksfifthavenue.com/search?q=${query}`;
       return region === 'UK' 
        ? `https://www.selfridges.com/GB/en/cat/?freeText=${query}`
        : `https://www.brownthomas.com/search/?q=${query}`;
    }
    
    if (b.includes('aldi') || b.includes('lidl') || b.includes('marks & spencer')) {
      return `https://www.google.com/search?q=${encodeURIComponent('Buy ' + searchQuery + ' perfume ' + region)}`;
    }
    
    if (b.includes('perry ellis') || b.includes('dossier')) {
      const amz = region === 'US' ? 'com' : (region === 'UK' ? 'co.uk' : 'de');
      return `https://www.amazon.${amz}/s?k=${query}`;
    }
    
    // Default fallback: Jomashop for US, Notino for EU
    if (region === 'US') {
      return `https://www.jomashop.com/search?q=${query}`;
    }
    return null;
  };
  const [error, setError] = useState(null);
  const [allPerfumes, setAllPerfumes] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [sortMode, setSortMode] = useState('name-asc');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome's automatic bottom-sheet prompt
      e.preventDefault();
      // Stash the event so it can be triggered when the user clicks our button
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDownloadClick = async () => {
    if (deferredPrompt) {
      // Show the native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      // We can only use the prompt once, so clear it
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS (Safari doesn't support the prompt API)
      alert("To install the app:\n\nOn iPhone: Tap the Share button at the bottom, then scroll down to 'Add to Home Screen'\n\nOn Android: Tap the 3-dot menu at the top right, then select 'Add to Home screen' or 'Install app'");
    }
  };

  useEffect(() => {
    // Auto-detect region
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'GB') {
          setRegion('UK');
        }
      })
      .catch(err => console.log('Geolocation skipped'));

    // Check if we just returned from a successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const uId = urlParams.get('userId');
      if (uId) {
        // Upgrade them via our backend shortcut
        fetch('/api/upgrade-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId })
        }).then(() => {
          // Remove the query string immediately so it doesn't double-fire
          window.history.replaceState({}, document.title, window.location.pathname);
          // Update the local state instantly so the camera unlocks without a refresh!
          setProfile(prev => prev ? { ...prev, tier: 'premium' } : { id: uId, tier: 'premium' });
          alert('Payment Successful! You are now a Premium Member. You can use the camera!');
        });
      }
    }

    const fetchProfile = async (userId) => {
      let { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      // If profile doesn't exist yet, auto-create it
      if (!data) {
        const { data: newProfile, error } = await supabase.from('profiles').insert([{ id: userId, tier: 'free' }]).select().single();
        if (!error) data = newProfile;
      }
      
      if (data) setProfile(data);
    };

    const fetchFavorites = async (userId) => {
      const { data } = await supabase.from('favorites').select('perfume_id').eq('user_id', userId);
      if (data) setFavorites(data.map(f => f.perfume_id));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      } else {
        setProfile(null);
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
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

  const selectPerfume = async (selectedOriginal) => {
    window.history.pushState({ view: 'perfume' }, '', '');
    setSearchResultsList([]);
    setLoading(true);
    try {
      setOriginal(selectedOriginal);
      
      const { data: finalDupes } = await supabase
        .from('dupes')
        .select('*')
        .eq('original_id', selectedOriginal.id)
        .order('similarity_match', { ascending: false });
        
      setDupes(finalDupes || []);
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading this perfume.");
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (term) => {
    if (!term.trim()) return;
    
    setSearchTerm(term);
    setHasSearched(true);
    window.history.pushState({ view: 'search' }, '', '');
    setLoading(true);
    setError(null);
    setOriginal(null);
    setDupes([]);
    setSearchResultsList([]);

    try {
      // 1. Try searching the 'perfumes' table (Originals) by name OR brand
      // 1. Try searching the 'perfumes' table (Originals) by name OR brand
      const searchWords = term.trim().toLowerCase().split(/\s+/).filter(w => w.length > 1);
      const ilikeParts = searchWords.map(w => `name.ilike.%${w}%,brand.ilike.%${w}%`);
      const orQuery = ilikeParts.join(',');

      let { data: perfumesData, error: perfumeError } = await supabase
        .from('perfumes')
        .select('*')
        .or(orQuery);
        
      if (perfumesData) {
        perfumesData.forEach(p => {
          const pString = `${p.brand} ${p.name}`.toLowerCase();
          p.score = searchWords.filter(w => pString.includes(w)).length;
          // Boost if the exact term is found as a substring
          if (pString.includes(term.toLowerCase().trim())) p.score += 10;
        });
        // Sort highest score first, only keep those with > 50% word match
        perfumesData = perfumesData.filter(p => p.score >= Math.ceil(searchWords.length / 2));
        perfumesData.sort((a, b) => b.score - a.score);
      }

      if (perfumesData && perfumesData.length > 0) {
        if (perfumesData.length === 1) {
          await selectPerfume(perfumesData[0]);
        } else {
          setSearchResultsList(perfumesData);
        }
      } else {
        // 2. If not found in originals, search the 'dupes' table by name OR brand
        // 2. If not found in originals, search the 'dupes' table by name OR brand
        let { data: dupesData, error: dupeError } = await supabase
          .from('dupes')
          .select('original_id, brand, name')
          .or(orQuery);
          
        if (dupesData) {
          dupesData.forEach(p => {
            const pString = `${p.brand} ${p.name}`.toLowerCase();
            p.score = searchWords.filter(w => pString.includes(w)).length;
            if (pString.includes(term.toLowerCase().trim())) p.score += 10;
          });
          dupesData = dupesData.filter(p => p.score >= Math.ceil(searchWords.length / 2));
          dupesData.sort((a, b) => b.score - a.score);
        }
          
        if (dupesData && dupesData.length > 0) {
          const uniqueOriginalIds = [...new Set(dupesData.map(d => d.original_id))];
          
          const { data: mappedOriginals } = await supabase
            .from('perfumes')
            .select('*')
            .in('id', uniqueOriginalIds);
            
          if (mappedOriginals && mappedOriginals.length === 1) {
            await selectPerfume(mappedOriginals[0]);
          } else if (mappedOriginals && mappedOriginals.length > 1) {
            setSearchResultsList(mappedOriginals);
          } else {
            setOriginal(null);
          }
        } else {
          setOriginal(null);
        }
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (perfumeId) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    
    if (favorites.includes(perfumeId)) {
      setFavorites(prev => prev.filter(id => id !== perfumeId));
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('perfume_id', perfumeId);
    } else {
      setFavorites(prev => [...prev, perfumeId]);
      await supabase.from('favorites').insert([{ user_id: session.user.id, perfume_id: perfumeId }]);
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
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    
    // If no profile exists yet, or they are on the free tier, show paywall
    if (!profile || profile.tier !== 'premium') {
      setShowPaywall(true);
      return;
    }

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
      // Send the image to our secure backend server
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      const identifiedName = data.name;
      
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
      setError(err.message || "An error occurred while analyzing the image. Please try again.");
      setLoading(false);
    }
  };

  const sortedPerfumes = [...allPerfumes].sort((a, b) => {
    if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
    if (sortMode === 'brand-asc') return a.brand.localeCompare(b.brand);
    if (sortMode === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortMode === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  return (
    <div className="min-h-screen bg-luxury-50 text-luxury-950 font-sans selection:bg-gold-light selection:text-luxury-950">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <RequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} userId={session?.user?.id} />
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
          
          {/* Region Toggle */}
          <div className="flex bg-luxury-100 rounded-full p-1 mr-2 border border-luxury-200">
            <button 
              onClick={() => setRegion('IE')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${region === 'IE' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}`}
            >
              € EUR
            </button>
            <button 
              onClick={() => setRegion('UK')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${region === 'UK' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}`}
            >
              £ GBP
            </button>
          </div>
          {session ? (
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-luxury-600 hover:text-luxury-900 text-sm font-medium flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="text-luxury-600 hover:text-luxury-900 text-sm font-medium flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
          <button 
            onClick={handleDownloadClick}
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

        {/* Results Area */}
        <div className="w-full max-w-4xl">
          
          {!hasSearched && !loading && (
            <div className="w-full animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-luxury-200">
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {sortedPerfumes.slice(0, visibleCount).map((perfume) => (
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
              {visibleCount < sortedPerfumes.length && (
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

          
          {hasSearched && !loading && !error && searchResultsList.length > 0 && (
            <div className="bg-white border border-luxury-200 rounded-3xl p-6 md:p-12 shadow-sm mb-12">
              <h2 className="font-serif text-2xl text-luxury-900 mb-8 text-center">We found {searchResultsList.length} perfumes. Select one:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResultsList.map(perfume => (
                  <div 
                    key={perfume.id} 
                    onClick={() => selectPerfume(perfume)}
                    className="group cursor-pointer border border-luxury-100 rounded-2xl p-6 flex flex-col items-center text-center hover:border-gold hover:shadow-md transition-all bg-luxury-50"
                  >
                    {perfume.image_url ? (
                      <div className="h-32 w-24 mb-4 relative overflow-hidden">
                        <img src={perfume.image_url} alt={perfume.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="h-32 w-24 mb-4 flex items-center justify-center bg-white rounded-lg border border-luxury-100">
                        <Sparkles className="text-gold w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <span className="text-luxury-500 text-xs tracking-widest uppercase mb-1">{perfume.brand}</span>
                    <h3 className="font-serif text-lg text-luxury-900 leading-tight mb-2">{perfume.name}</h3>
                    {perfume.price && <span className="font-bold text-luxury-900">{formatPrice(perfume.price)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSearched && !loading && !error && !original && searchResultsList.length === 0 && (
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
                  {original.price ? (
                    <p className="text-2xl text-luxury-900 font-semibold mb-4">{formatPrice(original.price)} <span className="text-sm font-normal text-luxury-400">Retail</span></p>
                  ) : (
                    <p className="text-lg font-medium text-luxury-500 mb-4 mt-2">Retail price currently unavailable</p>
                  )}
                  {original.notes && (
                    <div className="bg-luxury-50 p-4 rounded-xl border border-luxury-100 mt-2">
                      <p className="text-sm text-luxury-800"><span className="font-bold">Notes:</span> {original.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Original Buy Button */}
                <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-luxury-100 w-full sm:w-auto pt-6 sm:pt-0 sm:pl-8">
                  
                    {((region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)) ? (
                      <a 
                        href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-luxury-900 text-luxury-900 hover:bg-luxury-50 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap mb-3"
                      >
                        Buy Original <ExternalLink size={16} />
                      </a>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-400 border-2 border-gray-200 px-6 py-3 rounded-xl font-medium cursor-not-allowed mb-3">
                        Out of Stock Online
                      </button>
                    )}
                    <button 
                      onClick={() => toggleFavorite(original.id)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap border ${
                        favorites.includes(original.id)
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-luxury-50 text-luxury-700 border-luxury-200 hover:bg-luxury-100'
                      }`}
                    >
                      <Heart size={16} className={favorites.includes(original.id) ? 'fill-rose-500 text-rose-500' : ''} /> 
                      {favorites.includes(original.id) ? 'Saved' : 'Save to Favorites'}
                    </button>
                </div>
              </div>

              {/* Dupes List */}
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-serif text-2xl font-semibold text-luxury-900">Closest Matches ({filteredDupes.length})</h3>
              </div>

              {filteredDupes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-luxury-100">
                  <p className="text-luxury-500">We don't have any dupes recorded for this yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDupes.map((dupe, index) => (
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
                          {original?.price && dupe?.price && !isNaN(parseFloat(original.price)) && !isNaN(parseFloat(dupe.price)) && (
                            <div className="flex items-center gap-1.5 bg-luxury-100 text-luxury-800 px-3 py-1.5 rounded-lg text-sm font-semibold border border-luxury-200">
                              <Tag size={16} />
                              Save {formatPrice(parseFloat(original.price) - parseFloat(dupe.price))}
                            </div>
                          )}
                        </div>

                        {dupe.notes && (
                          <div className="bg-white p-3 rounded-xl border border-luxury-100 text-left">
                            <p className="text-xs text-luxury-800"><span className="font-bold">Notes:</span> {dupe.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-luxury-100 w-full sm:w-auto pt-6 sm:pt-0 sm:pl-8">
                        <div className="text-3xl font-bold text-luxury-900 mb-3">
                          {dupe.price ? formatPrice(dupe.price) : <span className="text-xl font-medium text-luxury-500">Prices vary</span>}
                        </div>
                        {['Aldi', 'Lidl'].includes(dupe.brand) ? (
                          <div className="w-full flex items-center justify-center gap-2 bg-luxury-100 text-luxury-600 px-6 py-3 rounded-xl font-medium whitespace-nowrap cursor-not-allowed">
                            Available In-Store Only
                          </div>
                        ) : (
                          ((region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)) ? (
                          <a 
                            href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                          >
                            Buy Dupe <ExternalLink size={16} />
                          </a>
                        ) : (
                          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed whitespace-nowrap">
                            Out of Stock Online
                          </button>
                        )
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

        {/* Legal & Compliance Footer */}
        <footer className="w-full mt-24 py-12 border-t border-luxury-200">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" size={20} />
              <span className="font-serif text-xl font-bold text-luxury-900 tracking-wider">
                SCENTS<span className="text-luxury-500">FOR</span>CENTS
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-luxury-500 font-medium">
              <button onClick={() => setLegalModalType('about')} className="hover:text-gold transition-colors">About Us</button>
              <button onClick={() => setLegalModalType('disclosure')} className="hover:text-gold transition-colors">Affiliate Disclosure</button>
              <button onClick={() => setLegalModalType('privacy')} className="hover:text-gold transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalModalType('terms')} className="hover:text-gold transition-colors">Terms of Service</button>
            </div>
            
            <div className="text-xs text-luxury-400 text-center md:text-right">
              &copy; {new Date().getFullYear()} Scents for Cents.<br/>All rights reserved.
            </div>
          </div>
        </footer>

        {/* Legal Modal */}
        <LegalModal 
          isOpen={legalModalType !== null} 
          type={legalModalType} 
          onClose={() => setLegalModalType(null)} 
        />

    </div>
  );
}

export default App;
