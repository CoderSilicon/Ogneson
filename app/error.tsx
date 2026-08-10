'use client';

import { useEffect, useState } from 'react';

const Error = ({ error, reset }) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to your analytics or console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 lexend-400">
      
      {/* Alchemical Unstable Element Tile */}
      <div className="w-56 h-56 border-2 border-red-950/80 bg-zinc-950 p-4 flex flex-col justify-between shadow-2xl relative mb-8 hover:border-red-900/60 transition-colors">
        
        {/* Top bar: Error Code & Instability Warning */}
        <div className="flex justify-between items-start text-xs text-red-400/80 font-mono">
          <span>500</span>
          <span className="text-[10px] tracking-widest uppercase text-red-500 font-bold animate-pulse">
            CRITICAL
          </span>
        </div>

        {/* Center: Symbol */}
        <div className="text-center my-auto">
          <span className="text-6xl font-bold tracking-wider text-red-500">
            Er
          </span>
          <p className="text-xs font-semibold tracking-widest text-zinc-300 uppercase mt-1">
            Unstable Reaction
          </p>
        </div>

        {/* Bottom: Alchemical classification */}
        <div className="text-center border-t border-zinc-800 pt-2 text-[10px] text-zinc-500 tracking-widest uppercase font-mono">
          Corrupted Essence
        </div>

        {/* Subtle red warning glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Narrative & Action Area */}
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Alchemical Rupture
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          The reaction collapsed unexpectedly. The components failed to bind during element synthesis.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 border border-red-500 bg-red-950/30 text-red-400 text-sm font-semibold hover:bg-red-500 hover:text-black transition-all duration-200 uppercase tracking-widest"
          >
            Re-Attempt Transmutation
          </button>

          {/* Toggle Raw Error Details */}
          {error?.message && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-zinc-500 underline hover:text-zinc-300 font-mono pt-2 sm:pt-0"
            >
              {showDetails ? 'Hide Diagnostics' : 'Inspect Grimoire'}
            </button>
          )}
        </div>

        {/* Collapsible Error Log Box */}
        {showDetails && error?.message && (
          <div className="mt-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded text-left text-xs font-mono text-zinc-400 max-h-32 overflow-y-auto break-all">
            <span className="text-red-400 font-bold block mb-1">&gt; Error Log:</span>
            {error.message}
          </div>
        )}
      </div>

    </div>
  );
};

export default Error;