import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const target = `        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-luxury-700 hover:text-luxury-900 transition-colors hidden sm:block">
            Sign In
          </button>
          <button 
            onClick={() => alert("To install the app, tap 'Share' then 'Add to Home Screen' on your phone!")}
            className="bg-luxury-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold transition-colors shadow-sm"
          >
            Download App
          </button>
        </div>`;

const replacement = `        <div className="flex items-center gap-4">
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
            onClick={() => alert("To install the app, tap 'Share' then 'Add to Home Screen' on your phone!")}
            className="bg-luxury-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold transition-colors shadow-sm"
          >
            Download App
          </button>
        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.jsx', content);
