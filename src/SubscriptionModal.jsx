import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Calendar, Loader2 } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, userId, profile }) {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setShowConfirm(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        setCheckingStatus(true);
        const res = await fetch(`/api/cancel-subscription?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.cancelAtPeriodEnd) {
          setCancelResult(data);
        }
      } catch (err) {
        console.warn('Status check failed:', err);
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };

    fetchStatus();
    return () => { isMounted = false; };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleCancelSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel subscription.');
      }
      setCancelResult(data);
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Could not open billing portal.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error opening Stripe portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-luxury-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-luxury-400 hover:text-luxury-900 rounded-full hover:bg-luxury-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-luxury-900 text-white p-6 text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-gold/20 border border-gold/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gold">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-1">Your Subscription</h2>
          <p className="text-luxury-200 text-xs tracking-wide uppercase font-semibold">
            Scents for Cents Premium
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center">
              {error}
            </div>
          )}

          {cancelResult ? (
            /* Post-Cancellation Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <Calendar size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-luxury-900">
                Subscription Scheduled to Cancel
              </h3>
              <p className="text-sm text-luxury-600 leading-relaxed">
                Your cancellation has been confirmed with Stripe. No future payments will be taken from your card.
              </p>
              <div className="bg-luxury-50 border border-luxury-200 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Full Access Retained
                </div>
                <p className="text-xs text-luxury-700">
                  You can continue using the <span className="font-semibold text-luxury-900">AI Camera Scanner</span> and all premium features without interruption until:
                </p>
                <div className="text-base font-bold text-luxury-900 pt-1">
                  📅 {cancelResult.endsAt}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 bg-luxury-900 text-white py-3 rounded-xl font-medium hover:bg-luxury-800 transition-colors text-sm shadow-sm"
              >
                Done
              </button>
            </div>
          ) : showConfirm ? (
            /* Confirmation Step */
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-luxury-900">
                Cancel your subscription?
              </h3>
              <p className="text-sm text-luxury-600 leading-relaxed text-left bg-luxury-50 p-4 rounded-2xl border border-luxury-100">
                • <strong>No more charges:</strong> Your recurring payment will immediately be stopped.<br/>
                • <strong>Keep your paid time:</strong> You will still have full access to the AI camera scanner until your current billing period ends.<br/>
                • <strong>Cancel anytime:</strong> There are no cancellation fees.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Processing with Stripe...' : 'Yes, Cancel My Subscription'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="w-full bg-luxury-100 hover:bg-luxury-200 text-luxury-900 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Keep My Subscription
                </button>
              </div>
            </div>
          ) : (
            /* Default Active Status View */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-emerald-900">Premium Membership Active</div>
                  <div className="text-xs text-emerald-700">Unlimited camera scans & instant dupe matches</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-luxury-600 bg-luxury-50 p-4 rounded-2xl border border-luxury-100">
                <div className="flex justify-between py-1 border-b border-luxury-200/50">
                  <span className="text-luxury-500">Plan Status</span>
                  <span className="font-semibold text-emerald-700">Active</span>
                </div>
                <div className="flex justify-between py-1 border-b border-luxury-200/50">
                  <span className="text-luxury-500">Payment Processing</span>
                  <span className="font-semibold text-luxury-800">Stripe (Encrypted)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-luxury-500">Cancellation Policy</span>
                  <span className="font-semibold text-luxury-800">Use until period ends</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  Cancel Subscription
                </button>

                <button
                  onClick={handleOpenStripePortal}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-luxury-500 hover:text-luxury-800 py-2 font-medium transition-colors"
                >
                  Manage card or invoices on Stripe <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
