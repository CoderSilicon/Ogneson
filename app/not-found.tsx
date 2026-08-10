import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 lexend-400">
      
      {/* Alchemical Periodic Element Tile */}
      <div className="w-56 h-56 border-2 border-zinc-700 bg-zinc-950 p-4 flex flex-col justify-between shadow-2xl relative mb-8 hover:border-zinc-500 transition-colors">
        
        {/* Top bar: Atomic Number & Weight */}
        <div className="flex justify-between items-start text-xs text-zinc-400 font-mono">
          <span>404</span>
          <span>[???]</span>
        </div>

        {/* Center: Symbol */}
        <div className="text-center my-auto">
          <span className="text-6xl font-bold tracking-wider text-white">
            Nf
          </span>
          <p className="text-sm font-semibold tracking-widest text-zinc-300 uppercase mt-1">
            Not Found
          </p>
        </div>

        {/* Bottom: Alchemical classification */}
        <div className="text-center border-t border-zinc-800 pt-2 text-[10px] text-zinc-500 tracking-widest uppercase font-mono">
          Transmutated Void
        </div>

        {/* Subtle decorative background detail */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Narrative & Call to Action */}
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Element Transmutation Failed
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          The page you are looking for has been dissolved into the ether or never existed in this realm.
        </p>

        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 border border-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-200 uppercase tracking-widest"
          >
            Return to Table
          </Link>
        </div>
      </div>

    </div>
  );
};

export default NotFound;