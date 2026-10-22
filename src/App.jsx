import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ArrowLeft, Home, ShieldCheck, Percent, Tag, User, Heart } from 'lucide-react';
import AuthModal from './AuthModal';
import PaywallModal from './PaywallModal';
import { supabase } from './supabaseClient';
import CameraScanner from './CameraScanner';
import RequestModal from './RequestModal';
import { Filter } from 'lucide-react';
import LegalModal from './LegalModal';
import SubscriptionModal from './SubscriptionModal';
import FragranceImage from './FragranceImage';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [original, setOriginal] = useState(null);
  const [dupes, setDupes] = useState([]);
  
  const resetToHome = () => {
    setOriginal(null);
    setDupes([]);
    setSearchResultsList([]);
    setHasSearched(false);
    setSearchTerm('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.state && window.history.state.view !== 'home') {
      window.history.pushState({ view: 'home' }, '', '');
    }
  };
  

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
    const b = (brand || '').toLowerCase().trim();
    const n = (name || '').trim();
    const cleanName = n.replace(new RegExp('^' + b + '\\s+', 'i'), '').trim();
    const searchQuery = cleanName.toLowerCase().includes(b) ? cleanName : `${brand} ${cleanName}`;
    const query = encodeURIComponent(searchQuery);

    if (b.includes('zara')) {
      const zaraRegion = region === 'US' ? 'us/en' : (region === 'UK' ? 'uk/en' : 'ie/en');
      return `https://www.zara.com/${zaraRegion}/search?searchTerm=${encodeURIComponent(cleanName)}`;
    }

    if (b.includes('marks & spencer') || b.includes('m&s')) {
      return region === 'IE'
        ? `https://www.marksandspencer.com/ie/search?q=${encodeURIComponent(cleanName + ' perfume')}`
        : `https://www.marksandspencer.com/search?q=${encodeURIComponent(cleanName + ' perfume')}`;
    }

    if (b.includes('aldi') || b.includes('lidl')) {
      const regLabel = region === 'UK' ? 'UK' : 'Ireland';
      return `https://www.google.com/search?q=${encodeURIComponent('Buy ' + brand + ' ' + cleanName + ' perfume ' + regLabel)}`;
    }

    if (b.includes('dossier')) {
      return `https://dossier.co/search?q=${encodeURIComponent(cleanName)}`;
    }

    if (b.includes('superdrug')) {
      return `https://www.superdrug.com/search?q=${encodeURIComponent(cleanName)}`;
    }

    if (b.includes('jenny glow')) {
      return region === 'UK'
        ? `https://www.notino.co.uk/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`
        : `https://www.notino.ie/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`;
    }

    if (b.includes('oakcha')) {
      return `https://www.oakcha.com/search?q=${encodeURIComponent(cleanName)}`;
    }

    if (
      b.includes('ex nihilo') || b.includes('creed') || b.includes('tom ford') ||
      b.includes('xerjoff') || b.includes('maison margiela') || b.includes('byredo') ||
      b.includes('le labo') || b.includes('dior') || b.includes('chanel') ||
      b.includes('ysl') || b.includes('yves saint laurent') || b.includes('giorgio armani') ||
      b.includes('paco rabanne') || b.includes('mugler') || b.includes('carolina herrera') ||
      b.includes('marc jacobs') || b.includes('jo malone') || b.includes('roja') ||
      b.includes('parfums de marly') || b.includes('kilian') || b.includes('diptyque') ||
      b.includes('acqua di parma') || b.includes('maison francis kurkdjian') ||
      b.includes('frederic malle') || b.includes('penhaligon') || b.includes('charlotte tilbury')
    ) {
      if (region === 'US') return `https://www.saksfifthavenue.com/search?q=${query}`;
      return region === 'UK'
        ? `https://www.selfridges.com/GB/en/cat/?freeText=${query}`
        : `https://www.brownthomas.com/search/?q=${query}`;
    }

    // Universal dupe & fragrance fallback: Notino for IE/UK, Jomashop for US
    if (region === 'UK') {
      return `https://www.notino.co.uk/search/?exps=${query}`;
    } else if (region === 'US') {
      return `https://www.jomashop.com/search?q=${query}`;
    } else {
      return `https://www.notino.ie/search/?exps=${query}`;
    }
  };
  const [error, setError] = useState(null);
  const PAGE_SIZE = 18;
  const [homePerfumes, setHomePerfumes] = useState([]);
  const [homePage, setHomePage] = useState(0);
  const [hasMoreHome, setHasMoreHome] = useState(true);
  const [homeLoading, setHomeLoading] = useState(true);
  const [loadingMoreHome, setLoadingMoreHome] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
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
      const sessionId = urlParams.get('session_id');
      if (uId) {
        // Upgrade them via our backend shortcut and link stripe_customer_id
        fetch('/api/upgrade-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId, sessionId: sessionId || null })
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

  const fetchHomePerfumes = async (pageToFetch = 0, currentSort = sortMode, isNewSort = false) => {
    let orderCol = 'name';
    let ascending = true;
    if (currentSort === 'name-asc') {
      orderCol = 'name';
      ascending = true;
    } else if (currentSort === 'brand-asc') {
      orderCol = 'brand';
      ascending = true;
    } else if (currentSort === 'price-asc') {
      orderCol = 'price';
      ascending = true;
    } else if (currentSort === 'price-desc') {
      orderCol = 'price';
      ascending = false;
    }

    const from = pageToFetch * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, count, error } = await supabase
        .from('perfumes')
        .select('id, brand, name, price, image_url', { count: 'exact' })
        .order(orderCol, { ascending })
        .range(from, to);

      if (!error && data) {
        setHomePerfumes(prev => isNewSort ? data : [...prev, ...data]);
        setHomePage(pageToFetch);
        setHasMoreHome((from + data.length) < (count || 0));
      }
    } catch (err) {
      console.error("Error loading home perfumes:", err);
    } finally {
      setHomeLoading(false);
      setLoadingMoreHome(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortMode(newSort);
    setHomeLoading(true);
    fetchHomePerfumes(0, newSort, true);
  };

  // Detect location and set currency on load + fetch first batch of home perfumes
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
      
    // Fetch only the first 18 perfumes on load
    fetchHomePerfumes(0, 'name-asc', true);
  }, []);

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

  const executeSearch = async (term, isCamera = false) => {
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
        if (perfumesData.length > 0) {
          const topScore = perfumesData[0].score;
          perfumesData = perfumesData.filter(p => p.score >= topScore - 2);
        }
      }

      if (perfumesData && perfumesData.length > 0) {
        // If camera scan OR exact definitive match, auto-select the best one
        if (isCamera || perfumesData.length === 1 || (perfumesData[0].score >= 10 && perfumesData[0].score > (perfumesData[1]?.score || 0))) {
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
          if (dupesData.length > 0) {
            const topScore = dupesData[0].score;
            dupesData = dupesData.filter(p => p.score >= topScore - 2);
          }
        }
          
        if (dupesData && dupesData.length > 0) {
          const uniqueOriginalIds = [...new Set(dupesData.map(d => d.original_id))];
          
          const { data: mappedOriginals } = await supabase
            .from('perfumes')
            .select('*')
            .in('id', uniqueOriginalIds);
            
          if (mappedOriginals && mappedOriginals.length > 0) {
            if (isCamera || mappedOriginals.length === 1) {
              await selectPerfume(mappedOriginals[0]);
            } else {
              setSearchResultsList(mappedOriginals);
            }
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
    if (loadingMoreHome || !hasMoreHome) return;
    setLoadingMoreHome(true);
    fetchHomePerfumes(homePage + 1, sortMode, false);
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
      await executeSearch(identifiedName, true);

    } catch (err) {
      console.error("AI processing error:", err);
      setError(err.message || "An error occurred while analyzing the image. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-luxury-50 text-luxury-950 font-sans selection:bg-gold-light selection:text-luxury-950 w-full">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <RequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} userId={session?.user?.id} />
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        userId={session?.user?.id} 
        profile={profile} 
      />
      {showCamera && (
        <CameraScanner 
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}
      
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-luxury-50/95 backdrop-blur-md border-b border-luxury-200/60 shadow-xs transition-all">
        <nav className="px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center max-w-5xl mx-auto w-full">
          <button 
            type="button"
            onClick={resetToHome}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none flex-shrink-0 text-left py-1 px-1 -my-1 -mx-1 rounded-lg active:scale-95 transition-transform focus:outline-none"
            title="Return to Home"
            aria-label="Return to Scents for Cents Home"
          >
            <Sparkles className="text-gold group-hover:rotate-12 transition-transform w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-serif font-bold text-luxury-900 tracking-wide text-base sm:text-xl">
              Scents for Cents
            </span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Region Toggle */}
            <div className="flex bg-luxury-100 rounded-full p-0.5 sm:p-1 border border-luxury-200">
              <button 
                onClick={() => setRegion('IE')}
                className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${region === 'IE' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}`}
                title="Switch to Euro"
              >
                <span className="sm:hidden">€</span>
                <span className="hidden sm:inline">€ EUR</span>
              </button>
              <button 
                onClick={() => setRegion('UK')}
                className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${region === 'UK' ? 'bg-white shadow text-luxury-900' : 'text-luxury-500 hover:text-luxury-700'}`}
                title="Switch to British Pound"
              >
                <span className="sm:hidden">£</span>
                <span className="hidden sm:inline">£ GBP</span>
              </button>
            </div>
            {session ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {profile?.tier === 'premium' && (
                  <button 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-gold/15 hover:bg-gold/25 text-luxury-900 border border-gold/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                    title="Manage or Cancel Subscription"
                  >
                    <Sparkles size={12} className="text-gold" />
                    <span className="hidden sm:inline">Premium</span>
                    <span className="text-[10px] text-luxury-500 font-medium underline">Manage</span>
                  </button>
                )}
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-luxury-600 hover:text-luxury-900 text-xs sm:text-sm font-medium flex items-center gap-1 p-1 sm:px-2"
                  title="Sign Out"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-luxury-600 hover:text-luxury-900 text-xs sm:text-sm font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-luxury-100 transition-colors"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </button>
            )}
            <button 
              onClick={handleDownloadClick}
              className="hidden sm:inline-flex bg-luxury-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-gold transition-colors shadow-sm whitespace-nowrap"
            >
              Download App
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center pt-4 pb-24 px-4 max-w-5xl mx-auto">
        
        <div className="text-center mb-8 sm:mb-10 max-w-3xl">
          <h1 
            onClick={resetToHome}
            className="font-serif text-3xl sm:text-5xl md:text-6xl text-luxury-900 mb-3 sm:mb-4 leading-tight flex items-center justify-center gap-3 cursor-pointer select-none active:scale-98 transition-transform"
            title="Return to Home"
          >
            Scents for Cents
          </h1>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-luxury-800 mb-4 sm:mb-6 leading-tight">
            Luxury Fragrances, <br/>
            <span className="italic text-gold-dark">Without the Premium Price.</span>
          </h2>
          <p className="text-luxury-700 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto px-2">
            Search for your favorite high-end designer perfume, and we'll reveal the closest, most affordable clones and dupes.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-4">
          <div className="relative flex items-center shadow-sm rounded-full overflow-hidden border border-luxury-200 bg-white focus-within:ring-2 focus-within:ring-gold focus-within:border-gold transition-all">
            <div className="pl-4 sm:pl-6 text-luxury-400">
              <Search size={22} className="sm:w-6 sm:h-6" />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Baccarat Rouge 540"
              className="w-full text-base sm:text-lg py-4 sm:py-5 pl-3 sm:pl-4 pr-12 sm:pr-16 focus:outline-none bg-transparent placeholder:text-luxury-300 font-medium"
            />
            {/* Premium Camera Button inside Search */}
            <button 
              type="button"
              onClick={handleCameraClick}
              className="absolute right-1.5 sm:right-2 p-2 sm:p-3 text-luxury-400 hover:text-gold hover:bg-luxury-50 rounded-full transition-colors flex items-center group tooltip-trigger"
              title="Scan a bottle (Premium)"
            >
              <Camera size={22} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="w-full max-w-4xl">
          
          {!hasSearched && !loading && (
            <div className="w-full animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-luxury-200">
                <h3 className="font-serif text-2xl sm:text-3xl text-luxury-900 font-bold text-center sm:text-left">Available Scents</h3>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={sortMode}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full sm:w-auto appearance-none bg-white border border-luxury-200 text-luxury-800 text-xs sm:text-sm py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-xl font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer"
                    >
                      <option value="name-asc">A-Z (Name)</option>
                      <option value="brand-asc">A-Z (Brand)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                    </select>
                    <Filter className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-luxury-400 pointer-events-none" size={14} />
                  </div>
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="bg-luxury-900 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-gold transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
                  >
                    Request Scent
                  </button>
                </div>
              </div>

              {homeLoading && homePerfumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-luxury-200 border-t-gold rounded-full animate-spin mb-3"></div>
                  <p className="text-luxury-500 text-sm font-medium animate-pulse">Loading curated collection...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {homePerfumes.map((perfume) => (
                      <div 
                        key={perfume.id} 
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          executeSearch(perfume.name);
                        }}
                        className="bg-white border border-luxury-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gold transition-all cursor-pointer text-center flex flex-col items-center justify-between group"
                      >
                        <div className="w-24 h-24 mb-4 bg-luxury-50 rounded-xl border border-luxury-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <FragranceImage 
                            src={perfume.image_url} 
                            alt={perfume.name} 
                            brand={perfume.brand} 
                            name={perfume.name} 
                            iconSize={26} 
                          />
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
                  {hasMoreHome && (
                    <div className="mt-10 flex justify-center">
                      <button 
                        onClick={handleLoadMore}
                        disabled={loadingMoreHome}
                        className="bg-white border-2 border-luxury-200 text-luxury-800 px-8 py-3 rounded-full font-medium hover:border-gold hover:text-luxury-900 transition-colors disabled:opacity-60 flex items-center gap-2"
                      >
                        {loadingMoreHome ? (
                          <>
                            <div className="w-4 h-4 border-2 border-luxury-400 border-t-luxury-900 rounded-full animate-spin"></div>
                            <span>Loading more...</span>
                          </>
                        ) : (
                          'See More Fragrances'
                        )}
                      </button>
                    </div>
                  )}
                </>
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
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-luxury-100">
                <button 
                  onClick={resetToHome}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-900 rounded-full text-sm font-semibold transition-all shadow-sm"
                >
                  <ArrowLeft size={18} /> Back to All Fragrances
                </button>
                <span className="text-xs text-luxury-500 font-medium">Found {searchResultsList.length} matches</span>
              </div>
              <h2 className="font-serif text-2xl text-luxury-900 mb-8 text-center">We found {searchResultsList.length} perfumes. Select one:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResultsList.map(perfume => (
                  <div 
                    key={perfume.id} 
                    onClick={() => selectPerfume(perfume)}
                    className="group cursor-pointer border border-luxury-100 rounded-2xl p-6 flex flex-col items-center text-center hover:border-gold hover:shadow-md transition-all bg-luxury-50"
                  >
                    <div className="h-32 w-24 mb-4 relative overflow-hidden flex items-center justify-center rounded-xl border border-luxury-100 bg-white">
                      <FragranceImage 
                        src={perfume.image_url} 
                        alt={perfume.name} 
                        brand={perfume.brand} 
                        name={perfume.name} 
                        iconSize={28} 
                      />
                    </div>
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
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={resetToHome}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-100 hover:bg-luxury-200 text-luxury-900 rounded-full font-medium transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back to All Fragrances
                </button>
                <button 
                  onClick={handleCameraClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-900 text-white rounded-full font-medium hover:bg-luxury-800 transition-colors"
                >
                  <Camera size={20} />
                  Try Scanning a Bottle
                </button>
              </div>
            </div>
          )}

          {hasSearched && !loading && !error && original && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Back Navigation Bar for iPhone / Mobile */}
              <div className="flex items-center justify-between mb-6 gap-2">
                <button 
                  onClick={() => {
                    if (searchResultsList && searchResultsList.length > 1) {
                      setOriginal(null);
                      setDupes([]);
                    } else {
                      resetToHome();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-white border border-luxury-200 hover:border-gold text-luxury-900 rounded-full text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow truncate"
                >
                  <ArrowLeft size={16} className="flex-shrink-0" /> 
                  <span className="truncate">{searchResultsList && searchResultsList.length > 1 ? 'Back to Search Results' : 'Back to All Fragrances'}</span>
                </button>
                
                <button
                  onClick={resetToHome}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-600 hover:text-luxury-900 px-3 sm:px-4 py-2 rounded-full hover:bg-luxury-100 transition-colors bg-white border border-luxury-200 flex-shrink-0"
                >
                  <Home size={14} /> Home
                </button>
              </div>
              
              {/* Original Perfume Header */}
              <div className="bg-white rounded-3xl p-5 sm:p-8 mb-8 shadow-sm border border-luxury-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 relative overflow-hidden">
                <div className="w-32 h-32 bg-luxury-50 rounded-2xl border border-luxury-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                  <FragranceImage 
                    src={original.image_url} 
                    alt={original.name} 
                    brand={original.brand} 
                    name={original.name} 
                    iconSize={36} 
                  />
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
                    <div key={dupe.id} className="group bg-white hover:bg-luxury-50 border border-luxury-200 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-stretch relative overflow-hidden">
                      
                      {/* Top Match Badge */}
                      {index === 0 && (
                        <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">Top Match</div>
                      )}

                      {/* Dupe Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-luxury-50 rounded-xl border border-luxury-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                        <FragranceImage 
                          src={dupe.image_url} 
                          alt={dupe.name} 
                          brand={dupe.brand} 
                          name={dupe.name} 
                          iconSize={28} 
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left w-full">
                        <h4 className="text-xl font-bold text-luxury-900 mb-1">{dupe.name}</h4>
                        <p className="text-luxury-600 mb-4">by {dupe.brand}</p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3">
                          {/* Similarity Badge */}
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 shadow-sm">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            {dupe.similarity_match || 90}% Match
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
                          <a 
                            href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                          >
                            Find In-Store / Online <ExternalLink size={16} />
                          </a>
                        ) : (
                          <a 
                            href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}
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

        {/* Legal & Compliance Footer */}
        <footer className="w-full mt-24 py-12 border-t border-luxury-200">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" size={20} />
              <span className="font-serif text-xl font-bold text-luxury-900 tracking-wider">
                SCENTS<span className="text-luxury-500">FOR</span>CENTS
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-luxury-500 font-medium">
              <button onClick={() => setLegalModalType('about')} className="hover:text-gold transition-colors">About Us</button>
              <button onClick={() => setLegalModalType('disclosure')} className="hover:text-gold transition-colors">Affiliate Disclosure</button>
              <button onClick={() => setLegalModalType('privacy')} className="hover:text-gold transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalModalType('terms')} className="hover:text-gold transition-colors">Terms of Service</button>
              <button onClick={handleDownloadClick} className="hover:text-gold transition-colors">Install App</button>
              {session && profile?.tier === 'premium' && (
                <button onClick={() => setShowSubscriptionModal(true)} className="text-rose-600 hover:text-rose-800 transition-colors font-semibold">
                  Cancel Subscription
                </button>
              )}
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
