import React from 'react';
import { Flame, Wind } from 'lucide-react';

export default function FragranceImage({ src, alt, brand, name, className = '', iconSize = 28 }) {
  const isCandle = name && (name.toLowerCase().includes('candle') || name.toLowerCase().includes('wax'));
  const isDiffuser = name && (name.toLowerCase().includes('diffuser') || name.toLowerCase().includes('reed'));

  // Get brand initial
  const initial = brand ? brand.trim().charAt(0).toUpperCase() : 'S';

  const renderFallback = () => (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-luxury-50/80 to-luxury-100/60 p-2 text-center select-none relative group-hover:from-white group-hover:to-luxury-50 transition-colors ${className}`}>
      {/* Decorative luxury border accent */}
      <div className="absolute inset-1.5 border border-gold/25 rounded-xl pointer-events-none" />
      
      {isCandle ? (
        <div className="flex flex-col items-center gap-1 text-gold">
          <Flame size={iconSize} className="stroke-[1.5]" />
          <span className="text-[9px] uppercase tracking-widest font-serif text-luxury-500 font-semibold">Candle</span>
        </div>
      ) : isDiffuser ? (
        <div className="flex flex-col items-center gap-1 text-gold">
          <Wind size={iconSize} className="stroke-[1.5]" />
          <span className="text-[9px] uppercase tracking-widest font-serif text-luxury-500 font-semibold">Diffuser</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          {/* Stylized Luxury Bottle Silhouette with Monogram */}
          <div className="relative flex items-center justify-center">
            <svg 
              width={iconSize + 8} 
              height={iconSize + 14} 
              viewBox="0 0 40 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gold/80"
            >
              {/* Bottle Cap */}
              <rect x="15" y="2" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              {/* Bottle Neck */}
              <rect x="17" y="8" width="6" height="4" stroke="currentColor" strokeWidth="1.5" />
              {/* Bottle Body */}
              <rect x="7" y="12" width="26" height="34" rx="4" stroke="currentColor" strokeWidth="1.5" />
              {/* Inner Label */}
              <rect x="11" y="19" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
            <span className="absolute font-serif text-xs font-bold text-luxury-900 tracking-tighter top-[21px]">
              {initial}
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-widest font-serif text-luxury-500 font-semibold mt-0.5">
            Parfum
          </span>
        </div>
      )}
    </div>
  );

  if (!src) {
    return renderFallback();
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt || name} 
        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextElementSibling) {
            e.currentTarget.nextElementSibling.style.display = 'flex';
          }
        }}
      />
      <div style={{ display: 'none' }} className="w-full h-full">
        {renderFallback()}
      </div>
    </div>
  );
}
