import React from 'react';
import { X, Sparkles, CheckCircle2, Lock } from 'lucide-react';

import { useState } from 'react';

export default function PaywallModal({ isOpen, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
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
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-500 hover:text-luxury-900 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-luxury-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <Lock className="w-12 h-12 mx-auto mb-4 text-gold-400" />
          <h2 className="text-3xl font-serif mb-2 relative z-10">Premium Feature</h2>
          <p className="text-luxury-200 relative z-10">
            Unlock the AI Camera Scanner to instantly find dupes from any photo.
          </p>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
              <span className="text-luxury-700">Unlimited AI camera scans</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
              <span className="text-luxury-700">Instantly identify any designer bottle</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
              <span className="text-luxury-700">Save hundreds of euros on premium clones</span>
            </li>
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gold-500 text-luxury-950 py-4 px-4 rounded-xl font-bold text-lg hover:bg-gold-400 focus:ring-4 focus:ring-gold-200 transition-all shadow-lg"
          >
            {loading ? 'Redirecting to secure checkout...' : 'Upgrade to Premium — €4.99/mo'}
          </button>
          
          <p className="text-center text-xs text-luxury-400 mt-4">
            Cancel anytime. Secure payment powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
