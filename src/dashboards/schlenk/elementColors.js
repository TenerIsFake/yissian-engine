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

  // ─── Period 4 — s-block flames + d-block aqueous ions + p-block ───
  K:  { color: '#9A6BCF', label: 'K',  compound: 'K flame (pale violet)' },
  Ca: { color: '#E85838', label: 'Ca', compound: 'Ca flame (brick red)' },
  Sc: { color: '#A0A8B0', label: 'Sc', compound: 'Sc³⁺ (pale)' },
  Ti: { color: '#C0C8D0', label: 'Ti', compound: 'TiO₂ (titanium white)' },
  V:  { color: '#6A4A8C', label: 'V',  compound: 'V²⁺ (violet)' },
  Cr: { color: '#2A8A5A', label: 'Cr', compound: 'Cr³⁺ (green)' },
  Mn: { color: '#8B2AA8', label: 'Mn', compound: 'MnO₄⁻ (permanganate purple)' },
  Fe: { color: '#C03A22', label: 'Fe', compound: 'Fe(SCN) (blood red)' },
  Co: { color: '#E8709A', label: 'Co', compound: 'Co²⁺ aq (pink)' },
  Ni: { color: '#3AA865', label: 'Ni', compound: 'Ni²⁺ aq (green)' },
  Cu: { color: '#3B97D4', label: 'Cu', compound: 'CuSO₄·5H₂O (azure)' },
  Zn: { color: '#B8BEC8', label: 'Zn', compound: 'Zn metal (bluish-white)' },
  Ga: { color: '#C8D0D8', label: 'Ga', compound: 'Ga metal (silvery)' },
  Ge: { color: '#9AA0A8', label: 'Ge', compound: 'Ge metalloid (grey-white)' },
  As: { color: '#8A7050', label: 'As', compound: 'As₂O₃ / arsenic grey' },
  Se: { color: '#A83722', label: 'Se', compound: 'Se red allotrope' },
  Br: { color: '#8B3A1E', label: 'Br', compound: 'Br₂ liquid (red-brown)' },
  Kr: { color: '#B8D8E8', label: 'Kr', compound: 'Kr discharge (whitish)' },
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
