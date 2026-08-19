import { PeriodicData, WAVE_FUNCTIONS, CRYSTAL_DATA, SPECTRAL_DATA } from "@/data/elementData";
import { CATEGORY_COLORS, TEXT_COLOR_MAP } from "@/data/elements";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Orbital3D } from "@/components/OrbitalGlow";
import { CrystalLatticeViewer } from "@/components/CrystalLattice";
import { SpectralSonification } from "@/components/SpectralSonification";

export default async function ElementBrief({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;

  const element = PeriodicData.find((el) => {
    return (
      el.id.toString() === slug ||
      el.symbol.toLowerCase() === slug.toLowerCase()
    );
  })!;

  // Resolve text color directly from element category
  const getTextColor = (category: string) => {
    const normalized = category.toLowerCase().replace(/[\s_]+/g, "-");
    return (
      TEXT_COLOR_MAP[normalized as keyof typeof TEXT_COLOR_MAP] ||
      "text-cyan-400"
    );
  };

  // Resolve background color for badges/accents
  const getBgColor = (category: string) => {
    const normalized = category.toLowerCase().replace(/[\s_]+/g, "-");
    return (
      CATEGORY_COLORS[normalized as keyof typeof CATEGORY_COLORS] ||
      "bg-cyan-500"
    );
  };

  const textClass = getTextColor(element.category);
  const bgClass = getBgColor(element.category);

  const imageFallback = `https://placehold.co/1600x600/050505/ffffff?text=${element.symbol}`;
  const displayImage =
    typeof element.image === "string" ? element.image : imageFallback;
  const oganessonFallbackMath = `\\Psi_{Og} \\approx \\frac{1}{\\sqrt{N!}} \\det \\left| \\chi_1(\\mathbf{r}_1) \\dots \\chi_N(\\mathbf{r}_N) \\right|`;
  const waveFunctionMath = WAVE_FUNCTIONS[element.id] || oganessonFallbackMath;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-6 md:p-12 selection:bg-white selection:text-black">
      <main className="max-w-6xl mx-auto flex flex-col gap-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
          <div>
            <div className="flex items-baseline gap-4 mb-2">
              <span
                className={`text-8xl md:text-9xl font-black lexend-900 tracking-tighter leading-none ${textClass}`}
              >
                {element.symbol}
              </span>
              <span className="text-2xl md:text-3xl lexend-300 text-zinc-600 font-light">
                #{element.id.toString().padStart(3, "0")}
              </span>
            </div>

            <h1
              className={`text-4xl md:text-6xl font-bold tracking-tight lexend-700 ${textClass}`}
            >
              {element.name}
            </h1>

            <p className="text-xs uppercase tracking-[0.3em] font-mono text-zinc-500 lexend-600 mt-2">
              {element.category}
            </p>
          </div>

          <div className="text-left md:text-right font-mono">
            <span className="text-[10px] uppercase tracking-widest lexend-100 text-zinc-600 block">
              Atomic Weight
            </span>
            <span className="text-3xl font-light text-zinc-200">
              {element.atomicMass}{" "}
              <span className="text-xs text-zinc-500">u</span>
            </span>
          </div>
        </header>

        <section className="relative w-full aspect-video md:aspect-21/9  overflow-hidden group">
          <img
            src={displayImage}
            alt={element.name}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <p className="text-sm md:text-base text-zinc-300 max-w-2xl font-light line-clamp-2 drop-shadow-md">
              {element.desc}
            </p>
            <div className="hidden sm:flex gap-4 font-mono text-xs lexend-200 text-zinc-400 bg-black/80 backdrop-blur-md px-4 py-2 border border-zinc-800">
              <span>Disc: {element.discoveredBy}</span>
              <span>•</span>
              <span>{element.discoveryYear}</span>
            </div>
          </div>
        </section>

        {/* 3. ELECTRON CONFIGURATION DISPLAY */}
        <section className="p-6 md:p-8">
          <h3 className="text-[10px] uppercase tracking-[0.3em] lexend-500 text-zinc-500 mb-6 font-mono">
            Electron Shell Structure
          </h3>

          <div className="flex flex-wrap gap-3">
            {element.electronConfiguration.split(" ").map((shell, idx) => {
              const isCore = shell.includes("[");
              return (
                <div
                  key={idx}
                  className={`px-5 py-3 font-mono text-xl border transition-all ${
                    isCore
                      ? "border-zinc-800 bg-zinc-900 text-zinc-400"
                      : `border-transparent ${bgClass} text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                  }`}
                >
                  {shell}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. QUANTUM WAVE FUNCTION & GLOWING ORBITAL VISUALIZER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10 bg-black">
          {/* Quantum Visualizer (Gradient) */}
          <div className="lg:col-span-5 flex justify-center items-center py-6 border-b lg:border-b-0 lg:border-r border-zinc-900">
            <Orbital3D
              bgClass={bgClass}
              config={element.electronConfiguration}
              category={element.category}
            />
          </div>

          {/* Equation & Description */}
          <div className="lg:col-span-7 flex flex-col justify-center lg:pl-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono lexend-500 text-zinc-500 mb-2">
              Quantum State Density
            </span>
            <div className="text-zinc-100 overflow-x-auto py-4 my-2">
              <BlockMath math={waveFunctionMath} />
            </div>
            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
              Calculated probability matrix <InlineMath math="|\Psi|^2" />{" "}
              defining orbital density shell distribution for{" "}
              <span className={textClass}>{element.name}</span>.
            </p>
          </div>
        </section>

        {/* 4b. INTERACTIVE 3D CRYSTAL LATTICE VIEWER */}
        {CRYSTAL_DATA[element.id] && (
          <section className="p-6 md:p-10 bg-black border border-zinc-900">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono lexend-500 text-zinc-500 mb-6 block">
              Crystal Lattice Structure
            </span>
            <CrystalLatticeViewer
              params={CRYSTAL_DATA[element.id]}
              textClass={textClass}
            />
          </section>
        )}

        {/* 5. VISUAL TELEMETRY CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Density"
            value={`${element.density}`}
            unit="g/cm³"
            textClass={textClass}
          />
          <MetricCard
            label="Melting Pt."
            value={`${element.meltingPoint}`}
            unit="K"
            textClass={textClass}
          />
          <MetricCard
            label="Boiling Pt."
            value={`${element.boilingPoint}`}
            unit="K"
            textClass={textClass}
          />
          <MetricCard
            label="Electronegativity"
            value={`${element.electronegativity}`}
            unit="Pauling"
            textClass={textClass}
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-t border-zinc-900 pt-8">
          <DataRow label="Atomic Radius" value={`${element.atomicRadius} pm`} />
          <DataRow label="Ionization Energy" value={element.ionizationEnergy} />
          <DataRow label="Electron Affinity" value={element.electronAffinity} />
          <DataRow label="Bonding Type" value={element.bondingType} />
          <DataRow label="Crystal Structure" value={element.crystalStructure} />
          <DataRow label="Reactivity" value={element.reactivity} />

          {/* Advanced Visual Components */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-2 items-end">
            <OxidationBadges states={element.oxidationStates} />
            <PhIndicator behavior={element.acidBaseBehavior} />
          </div>

          {/* New State of Matter Gauge spanning full width */}
          <StateOfMatterGauge
            mp={element.meltingPoint}
            bp={element.boilingPoint}
          />
        </section>

        {/* 6. SPECTRAL LINE SONIFICATION */}
        {SPECTRAL_DATA[element.id] && (
          <section className="p-6 md:p-10 bg-black border border-zinc-900">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono lexend-500 text-zinc-500 mb-6 block">
              Emission Spectrum &amp; Quantum Audio
            </span>
            <SpectralSonification
              lines={SPECTRAL_DATA[element.id]}
              symbol={element.symbol}
              textClass={textClass}
            />
          </section>
        )}

        {/* 7. ISOTOPES FOOTER */}
        <footer className="pt-4 pb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] lexend-400 text-zinc-600 block mb-4">
            Isotope Signatures
          </span>
          <div className="flex flex-wrap gap-2">
            {element.isotopes.map((iso) => (
              <span
                key={iso}
                className="px-3 py-1.5 bg-zinc-950 text-zinc-400 text-xs lexend-300 border border-zinc-900 hover:border-zinc-700 transition-colors"
              >
                {iso}
              </span>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}

// Visual Metric Card Component
function MetricCard({
  label,
  value,
  unit,
  textClass,
}: {
  label: string;
  value: string;
  unit: string;
  textClass: string;
}) {
  return (
    <div className="p-5 border border-zinc-900 bg-zinc-950/40 flex flex-col justify-between">
      <span className="text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono mb-4 block">
        {label}
      </span>
      <div>
        <span
          className={`text-2xl md:text-3xl font-light font-mono ${textClass}`}
        >
          {value}
        </span>
        <span className="text-xs text-zinc-600 font-mono ml-2">{unit}</span>
      </div>
    </div>
  );
}

// Minimal Clean Data Row
function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-900 font-mono">
      <span className="text-xs uppercase tracking-wider lexend-500 text-zinc-500">
        {label}
      </span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

function PhIndicator({ behavior }: { behavior: string }) {
  const label = behavior || "Neutral";
  const lower = label.toLowerCase();

  // Determine active qualitative zone
  let activeZone: "strongly-acidic" | "acidic" | "amphoteric" | "basic" | "strongly-basic" = "amphoteric";

  if (lower.includes("strongly acidic")) activeZone = "strongly-acidic";
  else if (lower.includes("acid")) activeZone = "acidic";
  else if (lower.includes("strongly basic")) activeZone = "strongly-basic";
  else if (lower.includes("base") || lower.includes("basic") || lower.includes("alkali")) activeZone = "basic";
  else activeZone = "amphoteric";

  const zones = [
    { key: "strongly-acidic", label: "Strongly Acidic", ph: "0–2", color: "border-red-500 text-red-400 bg-red-950/40" },
    { key: "acidic", label: "Acidic", ph: "3–6", color: "border-orange-500 text-orange-400 bg-orange-950/40" },
    { key: "amphoteric", label: "Amphoteric", ph: "7", color: "border-purple-500 text-purple-400 bg-purple-950/40" },
    { key: "basic", label: "Basic", ph: "8–11", color: "border-cyan-500 text-cyan-400 bg-cyan-950/40" },
    { key: "strongly-basic", label: "Strongly Basic", ph: "12–14", color: "border-blue-500 text-blue-400 bg-blue-950/40" },
  ];

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-zinc-900 font-mono">
      <div className="flex justify-between items-center text-xs lexend-400 tracking-wider text-zinc-500">
        <span>Nature</span>
        <span className="text-sm text-zinc-100 lexend-400">{label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mt-1">
        {zones.map((zone) => {
          const isActive = zone.key === activeZone;
          return (
            <div
              key={zone.key}
              className={`flex flex-col items-center justify-center p-2 rounded-sm border text-center transition-all ${
                isActive
                  ? `${zone.color} shadow-[0_0_12px_rgba(255,255,255,0.1)] font-bold scale-[1.02]`
                  : "border-zinc-800/80 bg-zinc-950/40 text-zinc-700 opacity-30"
              }`}
            >
              <span className="text-[9px] lexend-300 tracking-tighter leading-tight">
                {zone.label}
              </span>
              <span className="text-[8px] mt-1 text-zinc-500 lexend-400">pH {zone.ph}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// NEW: Oxidation State Badges
function OxidationBadges({ states }: { states: (string | number)[] }) {
  if (!states || states.length === 0) return null;

  return (
    <div className="flex flex-col justify-center gap-2 py-3 border-b border-zinc-900 font-mono">
      <span className="text-xs uppercase tracking-wider lexend-500 text-zinc-500">
        Oxidation States
      </span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {states.map((state, i) => {
          const num = Number(state);
          const isPositive = num > 0;
          const isZero = num === 0;
          return (
            <span
              key={i}
              className={`px-2 py-0.5 text-xs font-bold rounded-sm border ${
                isPositive
                  ? "bg-emerald-950/50 text-emerald-400 border-emerald-900"
                  : isZero
                    ? "bg-zinc-900 text-zinc-400 border-zinc-700"
                    : "bg-rose-950/50 text-rose-400 border-rose-900"
              }`}
            >
              {isPositive ? `+${state}` : state}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// NEW: State of Matter Visual Gauge
function StateOfMatterGauge({
  mp,
  bp,
}: {
  mp: string | number;
  bp: string | number;
}) {
  const meltingPoint = Number(mp);
  const boilingPoint = Number(bp);
  const ROOM_TEMP = 298.15; // Standard room temperature in Kelvin (25°C)

  if (isNaN(meltingPoint) || isNaN(boilingPoint)) {
    return (
      <div className="flex flex-col gap-2 py-3 border-b border-zinc-900 font-mono">
        <span className="text-xs uppercase tracking-wider lexend-500 text-zinc-500">
          State at Room Temp
        </span>
        <span className="text-sm text-zinc-500 italic">Data Unavailable</span>
      </div>
    );
  }

  // Determine current state
  let state = "Solid";
  let stateColor = "text-zinc-300";
  if (ROOM_TEMP >= boilingPoint) {
    state = "Gas";
    stateColor = "text-orange-400";
  } else if (ROOM_TEMP >= meltingPoint) {
    state = "Liquid";
    stateColor = "text-blue-400";
  }

  // Calculate percentage positions for the visual bar.
  // We use a dynamic max temperature to make the bar look good for both Helium (4K) and Tungsten (5800K+)
  const maxTemp = Math.max(boilingPoint * 1.2, ROOM_TEMP * 1.5, 1000);

  const mpPercent = Math.min((meltingPoint / maxTemp) * 100, 100);
  const bpPercent = Math.min((boilingPoint / maxTemp) * 100, 100);
  const rtPercent = Math.min((ROOM_TEMP / maxTemp) * 100, 100);

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-zinc-900 font-mono md:col-span-2 mt-2">
      <div className="flex justify-between items-center text-xs uppercase tracking-wider lexend-500 text-zinc-500">
        <span>State of Matter (298 K)</span>
        <span className={`text-sm font-bold lexend-800 ${stateColor}`}>{state}</span>
      </div>

      <div className="relative h-2 w-full bg-zinc-950 rounded-full mt-4 flex overflow-hidden border border-zinc-800">
        {/* Solid Phase Bar */}
        <div
          className="h-full bg-zinc-700/50 transition-all"
          style={{ width: `${mpPercent}%` }}
          title="Solid"
        />
        {/* Liquid Phase Bar */}
        <div
          className="h-full bg-blue-900/50 transition-all border-l border-blue-500/30"
          style={{ width: `${bpPercent - mpPercent}%` }}
          title="Liquid"
        />
        {/* Gas Phase Bar */}
        <div
          className="h-full bg-orange-900/30 transition-all border-l border-orange-500/30"
          style={{ width: `${100 - bpPercent}%` }}
          title="Gas"
        />

        {/* Room Temperature Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full z-10"
          style={{ left: `calc(${rtPercent}% - 2px)` }}
        />
      </div>

      <div className="relative w-full h-4 text-[9px] text-zinc-600">
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${mpPercent}%` }}
        >
          MP: {meltingPoint}K
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${bpPercent}%` }}
        >
          BP: {boilingPoint}K
        </span>
      </div>
    </div>
  );
}