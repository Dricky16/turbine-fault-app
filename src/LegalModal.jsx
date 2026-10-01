import React from 'react';
import { X } from 'lucide-react';

const contentMap = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-4 text-sm text-luxury-600 text-left">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>Welcome to Scents for Cents. We respect your privacy and are committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR).</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">1. Data Collection</h3>
        <p>We do not require account creation to use the basic search features of our service. If you choose to upgrade to a premium tier, billing and account information is securely processed by our payment provider (Stripe) and authentication provider (Supabase). We do not store your credit card details.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">2. Cookies and Tracking</h3>
        <p>We use essential cookies to maintain your session. We also use affiliate tracking links. When you click an external link to a retailer, a tracking cookie may be placed by the affiliate network to allocate commission for your purchase.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">3. Your Rights</h3>
        <p>Under GDPR, you have the right to access, rectify, or erase your personal data. Please contact us to exercise these rights.</p>
      </div>
    )
  },
  terms: {
    title: "Terms of Service",
    content: (
      <div className="space-y-4 text-sm text-luxury-600 text-left">
        <p>By accessing or using Scents for Cents, you agree to be bound by these Terms of Service.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">1. Educational Purpose</h3>
        <p>Scents for Cents is an independent fragrance comparison tool. We provide recommendations for alternative fragrances based on scent profiles and market analysis. We are not affiliated with, endorsed by, or sponsored by any of the designer fragrance brands mentioned on this site (e.g., Tom Ford, Creed, Chanel). All trademarks are the property of their respective owners.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">2. Pricing and Availability</h3>
        <p>We strive to keep pricing and links up to date, but prices and availability are subject to change by the retailers. We are not responsible for pricing discrepancies at checkout.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">3. Premium Subscriptions</h3>
        <p>Premium access provides additional features such as AI camera scanning and unlimited searches. Subscriptions are billed securely via Stripe.</p>
      </div>
    )
  },
  disclosure: {
    title: "Affiliate Disclosure",
    content: (
      <div className="space-y-4 text-sm text-luxury-600 text-left">
        <p>Transparency is important to us. Scents for Cents is a free tool designed to help you save money on luxury fragrances, and we fund its development through affiliate marketing.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">How We Make Money</h3>
        <p>When you click on links to various merchants on this site and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include, but are not limited to, the Amazon Associate program, AWIN, and other major retailer affiliate networks.</p>
        <p>This does not impact the price you pay. The commission is paid by the retailer as a thank-you for sending a customer their way.</p>
        <h3 className="font-bold text-luxury-900 text-base mt-6">Our Commitment to You</h3>
        <p>Our recommendations are driven strictly by scent similarity, quality, and value for money. We do not accept payment from brands to artificially rank a fragrance higher. If a dupe is recommended, it is because we genuinely believe it is a strong match.</p>
      </div>
    )
  },
  about: {
    title: "About Us",
    content: (
      <div className="space-y-4 text-sm text-luxury-600 text-left">
        <p>Welcome to Scents for Cents!</p>
        <p>We believe that smelling incredible shouldn't cost a fortune. The luxury fragrance industry is notorious for massive markups, with customers paying hundreds of euros primarily for the brand name on the bottle.</p>
        <p>Our mission is simple: to democratize luxury fragrance. We analyze the scent profiles, notes, and formulations of the world's most expensive designer perfumes and pair them with high-quality, affordable alternatives.</p>
        <p>Whether you're looking for a daily wear version of your €300 signature scent, or simply exploring the world of fragrances on a budget, our database is curated to help you discover luxury without the premium price tag.</p>
      </div>
    )
  }
};

export default function LegalModal({ isOpen, onClose, type }) {
  if (!isOpen || !type || !contentMap[type]) return null;

  const { title, content } = contentMap[type];

  return (
    <div className="fixed inset-0 bg-luxury-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-luxury-400 hover:text-luxury-900 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-serif text-3xl text-luxury-900 mb-6">{title}</h2>
        
        {content}

        <div className="mt-10 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-luxury-100 hover:bg-luxury-200 text-luxury-900 rounded-full font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
