import { getElectronShells } from "../data/electronshells";

interface AtomicGlyphProps {
  atomicNumber: number;
  className?: string;
}

// Ring radii for shells 1–7, tuned to a 0–100 viewBox centered at (50,50).
const SHELL_RADII = [8, 16, 24, 32, 39, 45, 49];

/**
 * Renders a tiny "atomic seal" — concentric rings of dots representing each
 * electron shell. Because it's derived directly from the atomic number,
 * every one of the 118 elements gets a genuinely distinct mark, and denser
 * elements naturally read as "busier" glyphs. Pure SVG, no assets needed.
 */
export default function AtomicGlyph({ atomicNumber, className = "" }: AtomicGlyphProps) {
  const shells = getElectronShells(atomicNumber);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.9" />
      {shells.map((count, shellIndex) => {
        const radius = SHELL_RADII[shellIndex];
        const dotRadius = count > 20 ? 1 : count > 10 ? 1.3 : 1.8;
        return (
          <g key={shellIndex}>
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.22"
            />
            {Array.from({ length: count }, (_, dotIndex) => {
              const angle = (2 * Math.PI * dotIndex) / count - Math.PI / 2;
              const cx = 50 + radius * Math.cos(angle);
              const cy = 50 + radius * Math.sin(angle);
              return (
                <circle
                  key={dotIndex}
                  cx={cx}
                  cy={cy}
                  r={dotRadius}
                  fill="currentColor"
                  opacity="0.75"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}