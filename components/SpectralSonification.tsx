"use client";

import { useCallback, useRef, useState } from "react";
import type { SpectralLine } from "@/data/elementData";

function wavelengthToRGB(wavelength: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
  }

  let factor: number;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength <= 700) {
    factor = 1;
  } else if (wavelength > 700 && wavelength <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700);
  } else {
    factor = 0;
  }

  r = Math.round(255 * Math.pow(r * factor, 0.8));
  g = Math.round(255 * Math.pow(g * factor, 0.8));
  b = Math.round(255 * Math.pow(b * factor, 0.8));

  return `rgb(${r},${g},${b})`;
}

function wavelengthToFrequency(wl: number): number {
  const c = 299792458;
  return c / (wl * 1e-9);
}

function frequencyToAudioFreq(freq: number): number {
  const minAudio = 220;
  const maxAudio = 880;
  const minFreq = 4.3e14;
  const maxFreq = 7.5e14;
  const t = Math.max(0, Math.min(1, (freq - minFreq) / (maxFreq - minFreq)));
  return minAudio + t * (maxAudio - minAudio);
}

function wavelengthToMidiNote(wl: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const freq = wavelengthToFrequency(wl);
  const audioFreq = frequencyToAudioFreq(freq);
  const midiNum = Math.round(69 + 12 * Math.log2(audioFreq / 440));
  const noteIdx = ((midiNum % 12) + 12) % 12;
  const octave = Math.floor(midiNum / 12) - 1;
  return `${notes[noteIdx]}${octave}`;
}

export function SpectralSonification({
  lines,
  symbol,
  textClass,
}: {
  lines: SpectralLine[];
  symbol: string;
  textClass: string;
}) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playLine = useCallback(
    (line: SpectralLine, index: number) => {
      const ctx = getAudioCtx();
      const freq = wavelengthToFrequency(line.wavelength);
      const audioFreq = frequencyToAudioFreq(freq);
      const duration = 0.6;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(audioFreq, ctx.currentTime);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(audioFreq, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3 * line.intensity, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getAudioCtx],
  );

  const playAllLines = useCallback(() => {
    if (isPlaying) {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      setIsPlaying(false);
      setActiveLine(null);
      return;
    }

    setIsPlaying(true);
    const sorted = [...lines].sort((a, b) => a.wavelength - b.wavelength);
    const gap = 700;

    sorted.forEach((line, i) => {
      const t = setTimeout(() => {
        const idx = lines.indexOf(line);
        setActiveLine(idx);
        playLine(line, idx);
      }, i * gap);
      timeoutsRef.current.push(t);
    });

    const endT = setTimeout(() => {
      setIsPlaying(false);
      setActiveLine(null);
    }, sorted.length * gap + 800);
    timeoutsRef.current.push(endT);
  }, [lines, isPlaying, playLine]);

  const playSingle = useCallback(
    (line: SpectralLine, index: number) => {
      setActiveLine(index);
      playLine(line, index);
      setTimeout(() => setActiveLine(null), 700);
    },
    [playLine],
  );

  const sortedLines = [...lines].sort((a, b) => a.wavelength - b.wavelength);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-2xl sm:text-3xl font-black font-mono ${textClass}`}>
          {symbol}
        </span>
        <button
          onClick={playAllLines}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider border transition-all flex-shrink-0 ${
            isPlaying
              ? "bg-red-950/60 border-red-800 text-red-400 hover:bg-red-900/60"
              : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
          }`}
        >
          {isPlaying ? "Stop" : "Play Spectrum"}
        </button>
      </div>

      <div className="relative w-full h-28 sm:h-36 md:h-44 flex items-end gap-[1px] sm:gap-[2px] p-1.5 sm:p-2 border border-zinc-900 bg-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "linear-gradient(90deg, #7c3aed 0%, #3b82f6 25%, #22c55e 50%, #eab308 75%, #ef4444 100%)",
          }}
        />

        {sortedLines.map((line, i) => {
          const color = wavelengthToRGB(line.wavelength);
          const originalIndex = lines.indexOf(line);
          const isActive = activeLine === originalIndex;
          return (
            <div
              key={`${line.wavelength}-${i}`}
              className="flex-1 relative cursor-pointer group z-10 min-w-0"
              style={{ height: `${line.intensity * 100}%` }}
              onClick={() => playSingle(line, originalIndex)}
            >
              <div
                className="absolute inset-0 transition-all duration-200"
                style={{
                  backgroundColor: color,
                  opacity: isActive ? 1 : 0.85,
                  transform: isActive ? "scaleX(1.5)" : "scaleX(1)",
                  boxShadow: isActive
                    ? `0 0 12px ${color}, 0 0 24px ${color}`
                    : "none",
                }}
              />
              <div className="hidden sm:block absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[8px] font-mono text-zinc-300 whitespace-nowrap z-20 pointer-events-none">
                {line.wavelength.toFixed(0)} nm
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-800" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {sortedLines.map((line, i) => {
          const color = wavelengthToRGB(line.wavelength);
          const originalIndex = lines.indexOf(line);
          const isActive = activeLine === originalIndex;
          return (
            <button
              key={`${line.wavelength}-${i}`}
              onClick={() => playSingle(line, originalIndex)}
              className={`flex flex-col gap-0.5 sm:gap-1 p-1.5 sm:p-2 border transition-all text-left ${
                isActive
                  ? "border-zinc-500 bg-zinc-800/60 scale-[1.02]"
                  : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive
                      ? `0 0 6px ${color}`
                      : "none",
                  }}
                />
                <span className="text-[8px] sm:text-[10px] font-mono text-zinc-400 truncate">
                  {line.label}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-1">
                <span className="text-[10px] sm:text-xs font-mono text-zinc-200">
                  {line.wavelength.toFixed(0)} nm
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 flex-shrink-0">
                  {wavelengthToMidiNote(line.wavelength)}
                </span>
              </div>
              <div className="w-full h-0.5 sm:h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${line.intensity * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-1">
        <div className="p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500 block mb-0.5 sm:mb-1">
            Range
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-200">
            {sortedLines[0].wavelength.toFixed(0)}–{sortedLines[sortedLines.length - 1].wavelength.toFixed(0)} nm
          </span>
        </div>
        <div className="p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500 block mb-0.5 sm:mb-1">
            Audio Range
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-200">
            {frequencyToAudioFreq(
              wavelengthToFrequency(sortedLines[0].wavelength),
            ).toFixed(0)}–{frequencyToAudioFreq(
              wavelengthToFrequency(sortedLines[sortedLines.length - 1].wavelength),
            ).toFixed(0)} Hz
          </span>
        </div>
        <div className="p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500 block mb-0.5 sm:mb-1">
            Lines
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-200">
            {lines.length} emission
          </span>
        </div>
      </div>
    </div>
  );
}
