import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Import AuthModal and User icon
content = content.replace("import { Search, Camera, Droplet, ChevronDown, CheckCircle2, Link } from 'lucide-react';", "import { Search, Camera, Droplet, ChevronDown, CheckCircle2, Link, User } from 'lucide-react';\nimport AuthModal from './AuthModal';");

// 2. Add session state
const stateTarget = `  const [showCamera, setShowCamera] = useState(false);`;
const stateReplacement = `  const [showCamera, setShowCamera] = useState(false);\n  const [session, setSession] = useState(null);\n  const [showAuthModal, setShowAuthModal] = useState(false);\n\n  useEffect(() => {\n    supabase.auth.getSession().then(({ data: { session } }) => {\n      setSession(session);\n    });\n    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {\n      setSession(session);\n    });\n    return () => subscription.unsubscribe();\n  }, []);`;
content = content.replace(stateTarget, stateReplacement);

// 3. Update handleCameraClick
const cameraTarget = `  const handleCameraClick = () => {
    setShowCamera(true);
  };`;
const cameraReplacement = `  const handleCameraClick = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setShowCamera(true);
  };`;
content = content.replace(cameraTarget, cameraReplacement);

// 4. Update Header to add Login/Logout button
const headerTarget = `          <button className="bg-luxury-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-luxury-800 transition-colors shadow-sm">
            Download App
          </button>`;
const headerReplacement = `          <div className="flex items-center gap-4">
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
            <button className="bg-luxury-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-luxury-800 transition-colors shadow-sm">
              Download App
            </button>
          </div>`;
content = content.replace(headerTarget, headerReplacement);

// 5. Add AuthModal component to render tree
const renderTarget = `      {showCamera && (`;
const renderReplacement = `      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showCamera && (`;
content = content.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.jsx', content);
