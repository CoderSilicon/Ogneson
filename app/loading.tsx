const Loading = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 lexend-400">
      
      {/* Alchemical Element Synthesis Tile */}
      <div className="w-56 h-56 border-2 border-zinc-700 bg-zinc-950 p-4 flex flex-col justify-between shadow-2xl relative mb-6 overflow-hidden">
        
        {/* Top bar: Dynamic Atomic Number & Status */}
        <div className="flex justify-between items-start text-xs text-zinc-400 font-mono">
          <span className="animate-pulse">000</span>
          <span className="text-[10px] tracking-widest uppercase text-zinc-500 animate-pulse">
            Synthesizing
          </span>
        </div>

        {/* Center: Element Symbol with Orbital Energy Effect */}
        <div className="text-center my-auto relative flex flex-col items-center justify-center">
          
          {/* Subtle spinning orbital ring behind symbol */}
          <div className="absolute w-24 h-24 border border-zinc-800 border-t-white rounded-full animate-spin pointer-events-none" />
          
          <span className="text-6xl font-bold tracking-wider text-white animate-pulse">
            Ld
          </span>
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mt-2">
            Transmuting
          </p>
        </div>

        {/* Bottom: Alchemical Classification */}
        <div className="text-center border-t border-zinc-800 pt-2 text-[10px] text-zinc-500 tracking-widest uppercase font-mono flex items-center justify-center gap-1.5">
          <span>Athanor Reaction</span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
        </div>

        {/* Top-to-Bottom Subtle Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* Narrative Subtext */}
      <div className="text-center space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 animate-pulse">
          Fusing Elements...
        </p>
      </div>

    </div>
  );
};

export default Loading;