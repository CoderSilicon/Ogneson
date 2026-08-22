"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { PeriodicData, SPECTRAL_DATA } from "@/data/elementData";

function wavelengthToRGB(wl: number): string {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / 50; b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
  else if (wl >= 645 && wl <= 780) { r = 1; }
  const f = wl >= 420 && wl <= 700 ? 1 : wl >= 380 && wl < 420 ? 0.3 + 0.7 * (wl - 380) / 40 : wl > 700 && wl <= 780 ? 0.3 + 0.7 * (780 - wl) / 80 : 0;
  r = Math.round(255 * Math.pow(r * f, 0.8));
  g = Math.round(255 * Math.pow(g * f, 0.8));
  b = Math.round(255 * Math.pow(b * f, 0.8));
  return `rgb(${r},${g},${b})`;
}

function wavelengthToAudioFreq(wl: number): number {
  const freq = 299792458 / (wl * 1e-9);
  const t = Math.max(0, Math.min(1, (freq - 3.8e14) / (7.8e14 - 3.8e14)));
  return 110 * Math.pow(2, t * Math.log2(1760 / 110));
}

const EL_SPECTRA = PeriodicData.filter((el) => SPECTRAL_DATA[el.id]?.length);

function Picker({ selected, onSelect, label, otherId }: {
  selected: (typeof PeriodicData)[0] | null;
  onSelect: (el: (typeof PeriodicData)[0] | null) => void;
  label: string;
  otherId?: number;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const list = EL_SPECTRA.filter((el) => {
    if (otherId && el.id === otherId) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return el.name.toLowerCase().includes(ql) || el.symbol.toLowerCase().includes(ql);
  });
  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <span className="text-[8px] uppercase tracking-wider text-zinc-600 font-mono block mb-1">{label}</span>
      <button onClick={() => setOpen((p) => !p)} className="w-full flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-colors text-left">
        {selected ? <><span className="text-sm font-mono text-zinc-200">{selected.symbol}</span><span className="text-[10px] text-zinc-500 truncate">{selected.name}</span></> : <span className="text-[10px] text-zinc-600 font-mono">Select element...</span>}
        <svg className="w-3 h-3 text-zinc-600 ml-auto shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l3 3 3-3" /></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-zinc-800 z-50 shadow-xl">
          <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-1.5">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 text-zinc-200 text-xs px-2 py-1 border border-zinc-700 outline-none font-mono" autoFocus />
          </div>
          {list.map((el) => (
            <button key={el.id} onClick={() => { onSelect(el); setOpen(false); setQ(""); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-900 text-left transition-colors">
              <span className="text-xs font-mono text-zinc-300 w-6">{el.symbol}</span>
              <span className="text-[10px] text-zinc-500 truncate">{el.name}</span>
              <span className="text-[9px] text-zinc-700 ml-auto font-mono">#{el.id}</span>
            </button>
          ))}
          {list.length === 0 && <p className="text-[10px] text-zinc-600 px-3 py-2 font-mono">No elements found</p>}
        </div>
      )}
    </div>
  );
}

function SpecBar({ lines, h = 36 }: { lines: { wavelength: number; intensity: number }[]; h?: number }) {
  return (
    <div className="relative w-full border border-zinc-900 bg-black overflow-hidden" style={{ height: h }}>
      {lines.map((l, i) => {
        const pos = ((l.wavelength - 380) / 400) * 100;
        const c = wavelengthToRGB(l.wavelength);
        return <div key={i} className="absolute top-0 bottom-0" style={{ left: `${Math.max(0, Math.min(100, pos))}%`, width: 2, backgroundColor: c, opacity: 0.4 + l.intensity * 0.6, boxShadow: `0 0 6px ${c}` }} />;
      })}
      <div className="absolute bottom-0.5 left-0.5 text-[7px] font-mono text-zinc-700">380nm</div>
      <div className="absolute bottom-0.5 right-0.5 text-[7px] font-mono text-zinc-700">780nm</div>
    </div>
  );
}
export function SpectralHarmonies() {
  const [open, setOpen] = useState(false);
  const [el1, setEl1] = useState<(typeof PeriodicData)[0] | null>(null);
  const [el2, setEl2] = useState<(typeof PeriodicData)[0] | null>(null);
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach((n) => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    setPlaying(false);
  }, []);

  const playChord = useCallback(() => {
    if (playing) { stopAll(); return; }
    if (!el1 || !el2) return;
    const ctx = ctxRef.current || new AudioContext();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    const mg = ctx.createGain();
    mg.gain.value = 0.15;
    mg.connect(ctx.destination);
    const l1 = SPECTRAL_DATA[el1.id] || [];
    const l2 = SPECTRAL_DATA[el2.id] || [];
    const all = [...l1.map((l) => ({ l, e: 1 as const })), ...l2.map((l) => ({ l, e: 2 as const }))];
    const n = all.length;
    all.forEach(({ l }) => {
      const af = wavelengthToAudioFreq(l.wavelength);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = af;
      const v = (l.intensity * 0.3) / Math.sqrt(n);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(v, ctx.currentTime + 1.8);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
      o.connect(g);
      g.connect(mg);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 2.6);
      nodesRef.current.push(o);
    });
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2700);
  }, [el1, el2, playing, stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const spec1 = el1 ? SPECTRAL_DATA[el1.id] || [] : [];
  const spec2 = el2 ? SPECTRAL_DATA[el2.id] || [] : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all hover:bg-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        <span className="text-base">&#9835;</span>
        <span className="hidden sm:inline">Spectral Harmonies</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 p-4 sm:p-6 relative">
            <button
              onClick={() => { stopAll(); setOpen(false); }}
              className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300 text-lg font-mono"
            >
              &times;
            </button>

            <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-mono text-zinc-500 mb-1">
              Spectral Harmonies
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-600 mb-4">
              Every element has a unique voice. Select two to hear their light as sound.
            </p>

            <div className="flex gap-3 mb-4">
              <Picker selected={el1} onSelect={setEl1} label="Element A" otherId={el2?.id} />
              <div className="flex items-end pb-2 text-zinc-700 text-sm font-mono">+</div>
              <Picker selected={el2} onSelect={setEl2} label="Element B" otherId={el1?.id} />
            </div>

            {spec1.length > 0 && (
              <div className="mb-2">
                <span className="text-[9px] font-mono text-cyan-500 mb-1 block">{el1?.symbol} spectrum</span>
                <SpecBar lines={spec1} />
              </div>
            )}
            {spec2.length > 0 && (
              <div className="mb-3">
                <span className="text-[9px] font-mono text-fuchsia-500 mb-1 block">{el2?.symbol} spectrum</span>
                <SpecBar lines={spec2} />
              </div>
            )}

            <button
              onClick={playChord}
              disabled={!el1 || !el2}
              className={`w-full py-2.5 font-mono text-xs uppercase tracking-wider transition-all ${
                el1 && el2
                  ? playing
                    ? "bg-emerald-900 border border-emerald-700 text-emerald-300"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                  : "bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed"
              }`}
            >
              {playing ? "Playing..." : el1 && el2 ? "Play Chord" : "Select two elements"}
            </button>

            <p className="text-[8px] text-zinc-800 mt-3 text-center font-mono">
              Optical wavelengths mapped to audible frequencies (110 Hz &ndash; 1760 Hz)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
