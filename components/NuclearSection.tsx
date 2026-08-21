"use client";

import { useState } from "react";

interface NuclearData {
  neutrons: number;
  isodiapher: number;
  Z: number;
  A: number;
  isobars: string[];
  isotones: string[];
  isotopes: string[];
  crystalStructure: string;
  allotropes: string[];
  isosteres: string[];
}

function StabilityPlot({ Z, N }: { Z: number; N: number }) {
  const maxVal = Math.max(Z, N, 118) + 5;

  const stabilityPoints: [number, number][] = [];
  for (let z = 1; z <= 118; z++) {
    const stableN = Math.round(z + 0.0066 * z * z);
    stabilityPoints.push([z, Math.min(stableN, 177)]);
  }

  const currentN = N;

  return (
    <div className="w-full aspect-[2/1] relative border border-zinc-900 bg-zinc-950/60 overflow-hidden">
      <svg viewBox={`0 0 ${maxVal} ${maxVal}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((v) => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={maxVal} stroke="#18181b" strokeWidth="0.3" />
            <line x1={0} y1={v} x2={maxVal} y2={v} stroke="#18181b" strokeWidth="0.3" />
          </g>
        ))}

        {/* N = Z line */}
        <line x1={0} y1={0} x2={Math.min(maxVal, 177)} y2={Math.min(maxVal, 177)}
          stroke="#52525b" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Line of stability */}
        <polyline
          points={stabilityPoints.map(([z, n]) => `${z},${n}`).join(" ")}
          fill="none"
          stroke="#22c55e"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Light elements on stability line (Z ≤ 20) */}
        {stabilityPoints.filter(([z]) => z <= 20).map(([z, n]) => (
          <circle key={z} cx={z} cy={n} r="0.8" fill="#22c55e" opacity="0.3" />
        ))}

        {/* Current element glow */}
        <circle cx={Z} cy={currentN} r="4" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" />
        <circle cx={Z} cy={currentN} r="2.5" fill="none" stroke="#ef4444" strokeWidth="0.3" opacity="0.6" />
        <circle cx={Z} cy={currentN} r="1.2" fill="#ef4444" />

        {/* Labels */}
        <text x={maxVal / 2} y={maxVal - 1} textAnchor="middle" fill="#52525b" fontSize="3" fontFamily="monospace">
          Z (Protons) →
        </text>
        <text x="1" y={maxVal / 2} textAnchor="middle" fill="#52525b" fontSize="3" fontFamily="monospace"
          transform={`rotate(-90, 1, ${maxVal / 2})`}>
          N (Neutrons) →
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute top-1 right-1 flex flex-col gap-0.5 text-[7px] sm:text-[8px] font-mono text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Z={Z}, N={currentN}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-0.5 bg-green-500 rounded" /> Stability line
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-0.5 bg-zinc-500 rounded border-dashed" /> N = Z
        </span>
      </div>
    </div>
  );
}

function IsodiapherMeter({ delta, Z, N }: { delta: number; Z: number; N: number }) {
  const maxScale = 40;
  const clampedDelta = Math.max(-maxScale, Math.min(maxScale, delta));
  const percentage = ((clampedDelta + maxScale) / (2 * maxScale)) * 100;
  const center = 50;

  return (
    <div className="w-full">
      <div className="relative h-3 w-full bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/30 via-zinc-800/20 to-emerald-900/30" />

        {/* Center mark */}
        <div className="absolute top-0 bottom-0 w-px bg-zinc-500 left-1/2 z-10" />

        {/* Delta position */}
        <div
          className="absolute top-0 bottom-0 w-1.5 rounded-sm z-20 transition-all duration-500"
          style={{
            left: `${percentage}%`,
            transform: "translateX(-50%)",
            backgroundColor: delta >= 0 ? "#22c55e" : "#ef4444",
            boxShadow: `0 0 8px ${delta >= 0 ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1 text-[8px] sm:text-[9px] font-mono text-zinc-600">
        <span>−{maxScale}</span>
        <span className="text-zinc-400">0</span>
        <span>+{maxScale}</span>
      </div>

      {/* Current value */}
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`text-lg sm:text-xl font-mono font-bold ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {delta >= 0 ? `+${delta}` : delta}
        </span>
        <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">
          N({N}) − Z({Z})
        </span>
      </div>
    </div>
  );
}

function TagList({ items, textClass }: { items: string[]; textClass: string }) {
  if (items.length === 0) {
    return <span className="text-[10px] sm:text-xs text-zinc-600 italic font-mono">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono border border-zinc-800 bg-zinc-900/60 ${textClass} hover:border-zinc-600 transition-colors`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function NuclearSection({
  data,
  textClass,
}: {
  data: NuclearData;
  textClass: string;
}) {
  const [quantumMode, setQuantumMode] = useState(false);

  return (
    <footer className="pt-4 pb-12">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] lexend-400 text-zinc-600">
          Structural Classification
        </span>
        <button
          onClick={() => setQuantumMode((p) => !p)}
          className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider border transition-all ${
            quantumMode
              ? "border-emerald-800 bg-emerald-950/50 text-emerald-400"
              : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
          }`}
        >
          {quantumMode ? "Nuclear Type" : "Normal Type"}
        </button>
      </div>

      {/* Primary grid — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
            Isotopes
          </span>
          <TagList items={data.isotopes} textClass={textClass} />
        </div>
        <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
            Isobars
          </span>
          <TagList
            items={data.isobars.length > 0 ? data.isobars : []}
            textClass={textClass}
          />
          {data.isobars.length === 0 && (
            <span className="text-[9px] text-zinc-600 font-mono">No other stable isobars</span>
          )}
        </div>
        <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
            Isotones (N={data.neutrons})
          </span>
          <TagList
            items={data.isotones.length > 0 ? data.isotones : []}
            textClass={textClass}
          />
          {data.isotones.length === 0 && (
            <span className="text-[9px] text-zinc-600 font-mono">Unique neutron count</span>
          )}
        </div>
        <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
            Allotropes
          </span>
          <TagList items={data.allotropes} textClass={textClass} />
          {data.allotropes.length === 0 && (
            <span className="text-[9px] text-zinc-600 font-mono">No well-characterized allotropes</span>
          )}
        </div>
      </div>

      {/* Quantum Mode — collapsible */}
      {quantumMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* N vs Z Stability Diagram */}
          <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
              Nuclear Stability Diagram
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono block mb-3">
              N vs Z — line of stable nuclides
            </span>
            <StabilityPlot Z={data.Z} N={data.neutrons} />
          </div>

          {/* Isodiapher Delta Meter */}
          <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
              Isodiapher Delta
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono block mb-3">
              Δ = N − Z (nuclear asymmetry measure)
            </span>
            <IsodiapherMeter delta={data.isodiapher} Z={data.Z} N={data.neutrons} />

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 border border-zinc-900 bg-zinc-950/40">
                <span className="text-[8px] text-zinc-600 font-mono block">Protons</span>
                <span className={`text-sm font-mono font-bold ${textClass}`}>{data.Z}</span>
              </div>
              <div className="p-2 border border-zinc-900 bg-zinc-950/40">
                <span className="text-[8px] text-zinc-600 font-mono block">Neutrons</span>
                <span className={`text-sm font-mono font-bold ${textClass}`}>{data.neutrons}</span>
              </div>
              <div className="p-2 border border-zinc-900 bg-zinc-950/40">
                <span className="text-[8px] text-zinc-600 font-mono block">N/Z Ratio</span>
                <span className={`text-sm font-mono font-bold ${textClass}`}>
                  {(data.neutrons / data.Z).toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Crystal Structure / Polymorphs */}
          <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
              Polymorphs
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono block mb-3">
              Crystal structure: {data.crystalStructure || "Unknown"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className={`px-2 py-1 text-[10px] sm:text-xs font-mono border ${textClass} bg-zinc-900/60 border-zinc-800`}>
                {data.crystalStructure || "Unknown"}
              </span>
              {(data.crystalStructure === "Hexagonal Close-Packed" || data.crystalStructure === "Double Hexagonal Close-Packed" || data.crystalStructure === "Graphite") && (
                <>
                  <span className="px-2 py-1 text-[10px] sm:text-xs font-mono border border-zinc-800 bg-zinc-900/60 text-zinc-400">
                    2H polytype
                  </span>
                  <span className="px-2 py-1 text-[10px] sm:text-xs font-mono border border-zinc-800 bg-zinc-900/60 text-zinc-400">
                    4H polytype
                  </span>
                  <span className="px-2 py-1 text-[10px] sm:text-xs font-mono border border-zinc-800 bg-zinc-900/60 text-zinc-400">
                    6H polytype
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Isosteres */}
          <div className="p-3 sm:p-4 border border-zinc-900 bg-zinc-950/40">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider lexend-500 text-zinc-500 font-mono block mb-2">
              Isosteres
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono block mb-3">
              Same valence electron count / similar EN
            </span>
            <TagList
              items={data.isosteres.length > 0 ? data.isosteres : []}
              textClass={textClass}
            />
            {data.isosteres.length === 0 && (
              <span className="text-[9px] text-zinc-600 font-mono">No close isosteres in PeriodicData</span>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
