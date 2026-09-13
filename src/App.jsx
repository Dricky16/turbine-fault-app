import React, { useState } from 'react';
import { Search, Image as ImageIcon, AlertTriangle, Wrench, X } from 'lucide-react';

// Hardcoded dummy data for Stage 1
const DUMMY_DATABASE = {
  "ERR-404": {
    code: "ERR-404",
    description: "Pitch Ram Pressure Low. Hydraulic fluid level is below operational threshold in the main accumulator.",
    fix: "1. Inspect main hydraulic lines for leaks.\n2. Verify accumulator charge.\n3. Top up hydraulic fluid to nominal levels.",
    hasDiagram: true
  },
  "TEMP-99": {
    code: "TEMP-99",
    description: "Generator Overheat. Stator winding temperature exceeds 120°C.",
    fix: "1. Check cooling fan operation.\n2. Verify coolant flow rate.\n3. Inspect radiator fins for debris.",
    hasDiagram: false
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setHasSearched(true);
    const found = DUMMY_DATABASE[searchTerm.toUpperCase()];
    setResult(found || null);
    setShowDiagram(false);
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col items-center py-20 px-4">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Turbine Fault Lookup</h1>
        <p className="text-industrial-700 text-lg">Enter a fault code to instantly retrieve diagnostics.</p>
        <p className="text-xs text-gray-500 mt-2">Try searching: ERR-404 or TEMP-99</p>
      </div>

      {/* Massive Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-12">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="e.g. ERR-404"
          className="w-full bg-industrial-800 text-white text-2xl py-6 pl-8 pr-16 rounded-2xl border-2 border-industrial-700 focus:border-industrial-accent focus:outline-none focus:ring-4 focus:ring-industrial-accent/20 transition-all placeholder:text-gray-600"
        />
        <button 
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-industrial-accent text-industrial-900 rounded-xl hover:bg-white transition-colors"
        >
          <Search size={28} />
        </button>
      </form>

      {/* Results Container */}
      <div className="w-full max-w-2xl">
        {hasSearched && result && (
          <div className="bg-industrial-800 border border-industrial-700 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-red-400" size={24} />
                  <h2 className="text-3xl font-bold text-white">{result.code}</h2>
                </div>
                <p className="text-xl text-gray-300">{result.description}</p>
              </div>
            </div>

            <div className="bg-industrial-900 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="text-industrial-accent" size={20} />
                <h3 className="text-lg font-semibold text-industrial-accent">Recommended Fix</h3>
              </div>
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {result.fix}
              </div>
            </div>

            {/* Conditional Diagram Button */}
            {result.hasDiagram && (
              <button 
                onClick={() => setShowDiagram(true)}
                className="w-full py-4 bg-industrial-700 hover:bg-industrial-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <ImageIcon size={20} />
                View Schematic Diagram
              </button>
            )}
          </div>
        )}

        {hasSearched && !result && (
          <div className="bg-industrial-800 border border-red-900/50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Code Not Found</h2>
            <p className="text-gray-400">No diagnostic information found for "{searchTerm}". Please verify the code and try again.</p>
          </div>
        )}
      </div>

      {/* Simple Image Modal */}
      {showDiagram && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-4xl bg-industrial-800 rounded-2xl overflow-hidden p-4 border border-industrial-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{result.code} - Hydraulic Schematic</h3>
              <button onClick={() => setShowDiagram(false)} className="text-gray-400 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            {/* Dummy Image Placeholder */}
            <div className="aspect-video bg-industrial-900 rounded-xl border border-industrial-700 flex items-center justify-center">
               <p className="text-gray-500 text-lg">Interactive Schematic Diagram for {result.code} goes here</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
