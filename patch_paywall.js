import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add PaywallModal import
content = content.replace("import AuthModal from './AuthModal';", "import AuthModal from './AuthModal';\nimport PaywallModal from './PaywallModal';");

// 2. Add state for profile and paywall modal
const stateTarget = `  const [showAuthModal, setShowAuthModal] = useState(false);`;
const stateReplacement = `  const [showAuthModal, setShowAuthModal] = useState(false);\n  const [showPaywall, setShowPaywall] = useState(false);\n  const [profile, setProfile] = useState(null);`;
content = content.replace(stateTarget, stateReplacement);

// 3. Update useEffect to fetch profile
const effectTarget = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);`;
const effectReplacement = `  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);`;
content = content.replace(effectTarget, effectReplacement);

// 4. Update handleCameraClick to check profile tier
const cameraTarget = `  const handleCameraClick = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setShowCamera(true);
  };`;
const cameraReplacement = `  const handleCameraClick = () => {
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
  };`;
content = content.replace(cameraTarget, cameraReplacement);

// 5. Add PaywallModal to render tree
const renderTarget = `      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />`;
const renderReplacement = `      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />\n      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />`;
content = content.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.jsx', content);
