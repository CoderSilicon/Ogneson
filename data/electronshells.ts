/**
 * Returns a simplified per-shell electron distribution using the classic
 * Bohr-model fill order (2, 8, 18, 32, 32, 18, 8 — which not-coincidentally
 * sums to 118, the current edge of the periodic table).
 *
 * This is NOT the real quantum-mechanical electron configuration — heavier
 * elements have aufbau exceptions this ignores — but it's the standard
 * simplified model used in most educational periodic table visuals, and
 * it's what powers the little atomic-ring glyph on each card.
 *
 * If you add a real `electronConfiguration` string to your element data,
 * the tooltip will prefer that and only fall back to this.
 */
const SHELL_CAPACITIES = [2, 8, 18, 32, 32, 18, 8];

export function getElectronShells(atomicNumber: number): number[] {
  let remaining = atomicNumber;
  const shells: number[] = [];
  for (const capacity of SHELL_CAPACITIES) {
    if (remaining <= 0) break;
    const electrons = Math.min(capacity, remaining);
    shells.push(electrons);
    remaining -= electrons;
  }
  return shells;
}