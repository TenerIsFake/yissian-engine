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

  // ─── Period 5 — s-block flames + d-block metals + p-block ───
  Rb: { color: '#D868B8', label: 'Rb', compound: 'Rb flame (red-violet)' },
  Sr: { color: '#E02828', label: 'Sr', compound: 'Sr flame (crimson red)' },
  Y:  { color: '#C0C8D0', label: 'Y',  compound: 'Y metal (silver-white)' },
  Zr: { color: '#B0B8C0', label: 'Zr', compound: 'Zr metal (grey)' },
  Nb: { color: '#A8B0B8', label: 'Nb', compound: 'Nb metal (blue-grey)' },
  Mo: { color: '#B8C0C8', label: 'Mo', compound: 'Mo metal (grey)' },
  Tc: { color: '#A8B0B0', label: 'Tc', compound: 'Tc metal (silvery, radioactive)' },
  Ru: { color: '#C0C8C8', label: 'Ru', compound: 'Ru metal (silvery)' },
  Rh: { color: '#D0D8D8', label: 'Rh', compound: 'Rh metal (pale silver)' },
  Pd: { color: '#D8D8D8', label: 'Pd', compound: 'Pd metal (silvery-white)' },
  Ag: { color: '#E0E0E0', label: 'Ag', compound: 'Ag metal (silver)' },
  Cd: { color: '#B8C8D0', label: 'Cd', compound: 'Cd metal (bluish-white)' },
  In: { color: '#C8D0D0', label: 'In', compound: 'In metal (silvery)' },
  Sn: { color: '#C0C0B8', label: 'Sn', compound: 'Sn metal (white tin)' },
  Sb: { color: '#A0A8B0', label: 'Sb', compound: 'Sb metal (silver-grey)' },
  Te: { color: '#8090A0', label: 'Te', compound: 'Te metal (silvery-white)' },
  I:  { color: '#6A2A90', label: 'I',  compound: 'I₂ vapor (violet)' },
  Xe: { color: '#8BB4E8', label: 'Xe', compound: 'Xe discharge (blue-white)' },

  // ─── Period 6 s-block ───
  Cs: { color: '#6380D8', label: 'Cs', compound: 'Cs flame (blue-violet)' },
  Ba: { color: '#A8D160', label: 'Ba', compound: 'BaCl₂ flame (pale green)' },

  // ─── Lanthanides (Ln³⁺ hydrated + phosphor + Aldrich Park overrides) ───
  // User overrides from Aldrich Park samples (Feb 2021): Ce=emerald, Pr=chartreuse,
  // Gd=deep red (charge-transfer complex), Sm=I₂ violet, Yb/Lu=pale Sm yellow.
  La: { color: '#D8D8D8', label: 'La', compound: 'La³⁺ (pale silver)' },
  Ce: { color: '#1EA580', label: 'Ce', compound: 'CeCl₃ (emerald — Aldrich Park)' },
  Pr: { color: '#C4E030', label: 'Pr', compound: 'Pr³⁺ (chartreuse — Aldrich Park)' },
  Nd: { color: '#C073A8', label: 'Nd', compound: 'NdCl₃·6H₂O (Nd rose)' },
  Pm: { color: '#D098B4', label: 'Pm', compound: 'Pm³⁺ (pink phosphor, radioactive)' },
  Sm: { color: '#6A2A90', label: 'Sm', compound: 'Sm³⁺ (I₂ violet — Aldrich Park)' },
  Eu: { color: '#E84060', label: 'Eu', compound: 'Eu²⁺ phosphor (red)' },
  Gd: { color: '#C03820', label: 'Gd', compound: 'Gd³⁺ (deep red — Aldrich Park)' },
  Tb: { color: '#3AD48B', label: 'Tb', compound: 'Tb³⁺ phosphor (green)' },
  Dy: { color: '#E8D474', label: 'Dy', compound: 'Dy³⁺ phosphor (yellow)' },
  Ho: { color: '#D8A0A0', label: 'Ho', compound: 'Ho³⁺ (pale pink)' },
  Er: { color: '#E0A0B8', label: 'Er', compound: 'Er³⁺ (rose)' },
  Tm: { color: '#C8E0B0', label: 'Tm', compound: 'Tm³⁺ phosphor (pale green)' },
  Yb: { color: '#E4D074', label: 'Yb', compound: 'Yb³⁺ (pale yellow — Aldrich Park)' },
  Lu: { color: '#E8D888', label: 'Lu', compound: 'Lu³⁺ (pale Sm yellow — Aldrich Park)' },

  // ─── Period 6 d-block + p-block ───
  Hf: { color: '#C8D0D0', label: 'Hf', compound: 'Hf metal (silver)' },
  Ta: { color: '#A0A8B0', label: 'Ta', compound: 'Ta metal (blue-grey)' },
  W:  { color: '#A8B0B8', label: 'W',  compound: 'W metal (grey-blue)' },
  Re: { color: '#B0B8C0', label: 'Re', compound: 'Re metal (silver-grey)' },
  Os: { color: '#2A3A4A', label: 'Os', compound: 'Os metal (blue-black)' },
  Ir: { color: '#D0D8D8', label: 'Ir', compound: 'Ir metal (silver-white)' },
  Pt: { color: '#E0E0E8', label: 'Pt', compound: 'Pt metal (platinum)' },
  Au: { color: '#E8A828', label: 'Au', compound: 'Au metal (gold)' },
  Hg: { color: '#C0C8D0', label: 'Hg', compound: 'Hg metal (quicksilver)' },
  Tl: { color: '#A8B0B8', label: 'Tl', compound: 'Tl metal (silver-grey)' },
  Pb: { color: '#3D434D', label: 'Pb', compound: 'PbS (galena)' },
  Bi: { color: '#D088A0', label: 'Bi', compound: 'Bi metal (iridescent pink)' },
  Po: { color: '#808878', label: 'Po', compound: 'Po metal (silver-grey)' },
  At: { color: '#4A1050', label: 'At', compound: 'At extrapolated (deep violet)' },
  Rn: { color: '#D45050', label: 'Rn', compound: 'Rn extrapolated (deep red)' },

  // ─── Period 7 s-block ───
  Fr: { color: '#8A2A30', label: 'Fr', compound: 'Fr extrapolated (deep red)' },
  Ra: { color: '#E04848', label: 'Ra', compound: 'Ra flame (crimson)' },

  // ─── Actinides (An³⁺ oxidation-state-dependent, uranyl anchors) ───
  Ac: { color: '#A0C8D8', label: 'Ac', compound: 'Ac³⁺ (pale blue glow)' },
  Th: { color: '#E8E8E8', label: 'Th', compound: 'Th metal (silver)' },
  Pa: { color: '#D8D8D8', label: 'Pa', compound: 'Pa metal (silver-grey)' },
  U:  { color: '#C8DB3C', label: 'U',  compound: 'UO₂²⁺ uranyl (fluorescent yellow-green)' },
  Np: { color: '#D8A870', label: 'Np', compound: 'Np (olive-tan)' },
  Pu: { color: '#7A4A8C', label: 'Pu', compound: 'Pu (purple)' },
  Am: { color: '#E0506A', label: 'Am', compound: 'Am (red)' },
  Cm: { color: '#B8E0C0', label: 'Cm', compound: 'Cm (pale green)' },
  Bk: { color: '#D8D870', label: 'Bk', compound: 'Bk (yellow)' },
  Cf: { color: '#80D48A', label: 'Cf', compound: 'Cf (fluorescent green)' },
  Es: { color: '#D8B848', label: 'Es', compound: 'Es (yellow)' },
  Fm: { color: '#8090A0', label: 'Fm', compound: 'Fm extrapolated (steel-grey)' },
  Md: { color: '#8090A0', label: 'Md', compound: 'Md extrapolated (steel-grey)' },
  No: { color: '#8090A0', label: 'No', compound: 'No extrapolated (steel-grey)' },
  Lr: { color: '#8090A0', label: 'Lr', compound: 'Lr extrapolated (steel-grey)' },

  // ─── Period 7 d-block + p-block (all extrapolated) ───
  Rf: { color: '#8090A0', label: 'Rf', compound: 'Rf extrapolated (steel-grey)' },
  Db: { color: '#8090A0', label: 'Db', compound: 'Db extrapolated (steel-grey)' },
  Sg: { color: '#8090A0', label: 'Sg', compound: 'Sg extrapolated (steel-grey)' },
  Bh: { color: '#8090A0', label: 'Bh', compound: 'Bh extrapolated (steel-grey)' },
  Hs: { color: '#8090A0', label: 'Hs', compound: 'Hs extrapolated (steel-grey)' },
  Mt: { color: '#8090A0', label: 'Mt', compound: 'Mt extrapolated (steel-grey)' },
  Ds: { color: '#8090A0', label: 'Ds', compound: 'Ds extrapolated (steel-grey)' },
  Rg: { color: '#8090A0', label: 'Rg', compound: 'Rg extrapolated (steel-grey)' },
  Cn: { color: '#8090A0', label: 'Cn', compound: 'Cn extrapolated (steel-grey)' },
  Nh: { color: '#8090A0', label: 'Nh', compound: 'Nh extrapolated (steel-grey)' },
  Fl: { color: '#8090A0', label: 'Fl', compound: 'Fl extrapolated (steel-grey)' },
  Mc: { color: '#8090A0', label: 'Mc', compound: 'Mc extrapolated (steel-grey)' },
  Lv: { color: '#8090A0', label: 'Lv', compound: 'Lv extrapolated (steel-grey)' },
  Ts: { color: '#8090A0', label: 'Ts', compound: 'Ts extrapolated (steel-grey)' },
  Og: { color: '#8090A0', label: 'Og', compound: 'Og extrapolated (steel-grey)' },
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
