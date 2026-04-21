// SCHLENK — per-element compound colors (Aldrich Park palette)
// Each element gets a color derived from one of 6 rules (see spec §2.3):
//   s-block → flame-test color
//   p-block → molecular/elemental color (F₂ gas, S₈ solid, etc.)
//   d-block → most common aqueous ion / iconic compound
//   f-block → hydrated Ln³⁺/An³⁺ ion (with Aldrich Park overrides for Ce, Pr, Gd, Sm, Yb, Lu)
//   noble gases → discharge-tube emission
//   super-heavy / extrapolated → neutral steel-grey
//
// Populated in Tasks 2–6 of Sprint 1.

const DEFAULT_COLOR = '#8090A0';  // steel-grey fallback
const EXTRAPOLATED = '#8090A0';   // same hex, semantic alias for super-heavies

// Populated progressively in Tasks 2-6
export const ELEMENT_COLORS = {};

/**
 * Look up the compound color metadata for an element symbol.
 * @param {string} symbol — element symbol (e.g. 'La', 'Cu', 'Fe')
 * @returns {{ color: string, label: string, compound: string }}
 */
export function getElementColor(symbol) {
  const entry = ELEMENT_COLORS[symbol];
  if (!entry) {
    return { color: DEFAULT_COLOR, label: symbol || '?', compound: 'unknown / extrapolated' };
  }
  return entry;
}
