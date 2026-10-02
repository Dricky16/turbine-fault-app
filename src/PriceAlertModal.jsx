import React, { useState } from 'react';
import { X, BellRing, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function PriceAlertModal({ isOpen, onClose, perfume }) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(perfume ? Math.floor(perfume.price * 0.85) : 0); // Default to 15% off
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !perfume) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || targetPrice >= perfume.price) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { error: dbError } = await supabase
        .from('price_alerts')
        .insert([
          { 
            perfume_id: perfume.id, 
            user_email: email.trim(), 
            target_price: targetPrice 
          }
        ]);
        
      if (dbError) throw dbError;
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        onClose();
      }, 3000);
      
    } catch (err) {
      console.error('Error saving alert:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-xl">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-luxury-400 hover:text-luxury-900 transition-colors"
        >
          <X size={24} />
        </button>
        
        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-luxury-900 mb-2">Alert Set!</h2>
            <p className="text-luxury-600">We will email you the moment {perfume.name} drops to €{targetPrice} or lower.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <BellRing className="text-gold" size={28} />
              <h2 className="text-2xl font-serif font-bold text-luxury-900">Price Drop Alert</h2>
            </div>
            <p className="text-luxury-600 mb-6">Never pay full retail. Get notified instantly when {perfume.name} goes on sale.</p>
            
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-luxury-900 mb-1">Current Retail Price</label>
                <div className="w-full px-4 py-3 rounded-xl bg-luxury-50 border border-luxury-100 text-luxury-500 font-medium">
                  €{perfume.price.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-luxury-900 mb-1">Alert me when it drops below: *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-luxury-500 font-bold">€</span>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max={perfume.price - 1}
                    value={targetPrice}
                    onChange={e => setTargetPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-luxury-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-900 mb-1">Your Email *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-luxury-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting || !email.trim() || targetPrice >= perfume.price}
                className="w-full bg-luxury-900 text-white font-bold py-3 rounded-xl mt-4 hover:bg-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <BellRing size={18} />
                {submitting ? 'Saving...' : 'Set Price Alert'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
