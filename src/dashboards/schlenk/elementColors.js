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
export const ELEMENT_COLORS = {
  // ─── Period 1 ───
  H:  { color: '#D8E8F0', label: 'H',  compound: 'H₂ gas (colorless-pale-blue)' },
  He: { color: '#F0B4A8', label: 'He', compound: 'He discharge (pale pink)' },

  // ─── Period 2 — p-block molecular colors ───
  Li: { color: '#D14545', label: 'Li', compound: 'Li flame test (crimson)' },
  Be: { color: '#B8C0C8', label: 'Be', compound: 'Be metal (grey-white)' },
  B:  { color: '#A8A8A0', label: 'B',  compound: 'B crystalline (pale brown)' },
  C:  { color: '#2A2A2A', label: 'C',  compound: 'C graphite (carbon black)' },
  N:  { color: '#B8B8C0', label: 'N',  compound: 'N₂ gas (colorless)' },
  O:  { color: '#88AACC', label: 'O',  compound: 'O₂ liquid (pale blue)' },
  F:  { color: '#E0F050', label: 'F',  compound: 'F₂ gas (pale yellow-green)' },
  Ne: { color: '#E84828', label: 'Ne', compound: 'Ne discharge (red-orange)' },

  // ─── Period 3 — flame tests + molecular ───
  Na: { color: '#F5B438', label: 'Na', compound: 'Na D-line (sodium yellow)' },
  Mg: { color: '#F0F0E8', label: 'Mg', compound: 'Mg flame (bright white)' },
  Al: { color: '#D8D8DC', label: 'Al', compound: 'Al metal (silver-white)' },
  Si: { color: '#6E7985', label: 'Si', compound: 'Si wafer (silicon grey)' },
  P:  { color: '#A83725', label: 'P',  compound: 'P red phosphorus (oxblood)' },
  S:  { color: '#E0C432', label: 'S',  compound: 'S₈ rhombic (sulfur yellow)' },
  Cl: { color: '#C0D840', label: 'Cl', compound: 'Cl₂ gas (yellow-green)' },
  Ar: { color: '#B08BE8', label: 'Ar', compound: 'Ar discharge (argon lilac)' },
};

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
