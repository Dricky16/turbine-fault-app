import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function RequestModal({ isOpen, onClose }) {
  const [scentName, setScentName] = useState('');
  const [brand, setBrand] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scentName.trim()) return;
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/request-scent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          scentName,
          brand
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setScentName('');
          setBrand('');
          onClose();
        }, 2500);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Something went wrong. Please try again later.');
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
              <Send size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-luxury-900 mb-2">Request Sent!</h2>
            <p className="text-luxury-600">We'll look for the best dupes for this scent and add it soon.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-serif font-bold text-luxury-900 mb-2">Request a Scent</h2>
            <p className="text-luxury-600 mb-6">Can't find your favorite perfume? Let us know and we'll track down the best dupes for it.</p>
            
            {error && <p className="text-red-500 mb-4 text-sm font-medium text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-luxury-900 mb-1">Perfume Name *</label>
                <input 
                  type="text" 
                  required
                  value={scentName}
                  onChange={e => setScentName(e.target.value)}
                  placeholder="e.g. Aventus"
                  className="w-full px-4 py-3 rounded-xl border border-luxury-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-luxury-900 mb-1">Brand (Optional)</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Creed"
                  className="w-full px-4 py-3 rounded-xl border border-luxury-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting || !scentName.trim()}
                className="w-full bg-luxury-900 text-white font-bold py-3 rounded-xl mt-4 hover:bg-gold transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
