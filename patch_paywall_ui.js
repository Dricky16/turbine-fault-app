import fs from 'fs';

let content = fs.readFileSync('src/PaywallModal.jsx', 'utf8');

const target1 = `export default function PaywallModal({ isOpen, onClose }) {`;
const rep1 = `import { useState } from 'react';\n\nexport default function PaywallModal({ isOpen, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };`;
content = content.replace(target1, rep1);

const target2 = `onClick={() => alert('Stripe Checkout coming next!')}`;
const rep2 = `onClick={handleUpgrade}\n            disabled={loading}`;
content = content.replace(target2, rep2);

const target3 = `Upgrade to Premium — €4.99/mo`;
const rep3 = `{loading ? 'Redirecting to secure checkout...' : 'Upgrade to Premium — €4.99/mo'}`;
content = content.replace(target3, rep3);

fs.writeFileSync('src/PaywallModal.jsx', content);

let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const appTarget1 = `<PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />`;
const appRep1 = `<PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} userId={session?.user?.id} />`;
appContent = appContent.replace(appTarget1, appRep1);

const appEffectTarget = `useEffect(() => {
    const fetchProfile = async (userId) => {`;
const appEffectRep = `useEffect(() => {
    // Check if we just returned from a successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const uId = urlParams.get('userId');
      if (uId) {
        // Upgrade them via our backend shortcut
        fetch('http://localhost:3001/api/upgrade-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId })
        }).then(() => {
          // Remove the query string
          window.history.replaceState({}, document.title, window.location.pathname);
          alert('Payment Successful! You are now a Premium Member. You can use the camera!');
        });
      }
    }

    const fetchProfile = async (userId) => {`;
appContent = appContent.replace(appEffectTarget, appEffectRep);

fs.writeFileSync('src/App.jsx', appContent);
