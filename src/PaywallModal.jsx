import React from 'react';
import { X, Sparkles, CheckCircle2, Lock, Star } from 'lucide-react';
import { useState } from 'react';

export default function PaywallModal({ isOpen, onClose, userId }) {
  const [loadingType, setLoadingType] = useState(null); // 'monthly' or 'yearly'
  
  const handleUpgrade = async (type) => {
    setLoadingType(type);
    
    // Read from Vite environment variables
    const priceId = type === 'yearly' 
      ? import.meta.env.VITE_STRIPE_PRICE_YEARLY 
      : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
      
    if (!priceId) {
      alert("Billing is not fully configured yet. Please try again later.");
      setLoadingType(null);
      return;
    }
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, priceId })
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
      setLoadingType(null);
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
          <h2 className="text-3xl font-serif mb-2 relative z-10">Premium Scanner</h2>
          <p className="text-luxury-200 relative z-10">
            Unlock the AI Camera Scanner to instantly find dupes from any photo.
          </p>
        </div>

        <div className="p-8 pb-6">
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

          <div className="space-y-3">
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={loadingType !== null}
              className="w-full relative bg-gold-500 text-luxury-950 pt-7 pb-3 px-4 rounded-xl font-bold text-lg hover:bg-gold-400 focus:ring-4 focus:ring-gold-200 transition-all shadow-md overflow-hidden border-2 border-gold-600 flex flex-col items-center justify-center gap-1"
            >
              <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-[10px] uppercase tracking-wider font-bold py-1 text-center">
                Best Value (Save 15%)
              </div>
              <span>{loadingType === 'yearly' ? 'Redirecting...' : 'Yearly — €40.00 / year'}</span>
            </button>
            
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={loadingType !== null}
              className="w-full bg-luxury-50 text-luxury-900 border-2 border-luxury-200 py-3 px-4 rounded-xl font-bold hover:bg-luxury-100 focus:ring-4 focus:ring-luxury-100 transition-all shadow-sm"
            >
              {loadingType === 'monthly' ? 'Redirecting...' : 'Monthly — €3.99 / month'}
            </button>
          </div>
          
          <p className="text-center text-xs text-luxury-400 mt-5">
            Cancel anytime. Secure payment powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
