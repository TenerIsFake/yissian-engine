// SCHLENK — element symbol → characteristic gas (Palette C blend)
// Drives per-card liquid color in the SCHLENK mode cardTransform.
// Colors pulled from the approved ABC-blend palette in src/themes/modes/schlenk.js.

// Gas color anchors (Palette C — gas-coded)
const AR = '#B47FE8'; // Argon — violet plasma discharge
const N2 = '#5FD4A8'; // Nitrogen — inert green
const H2 = '#E8789A'; // Hydrogen — pink
const O2 = '#FFB866'; // Oxygen — orange
const HE = '#E8D48A'; // Helium — pale gold
const CO2 = '#7A9BAE'; // Carbon dioxide — cool grey
const NE = '#F58A6B'; // Neon — coral

// Element → gas assignment
// Lanthanides (MEDIA services) default to Ar — rare-earth chemistry runs under Ar.
// Actinides (INFRA) default to N2 — bulk-inert condenser atmosphere.
// Bots (light elements) use the element's real gas family.
const GAS_BY_SYMBOL = {
  // MEDIA zone — Lanthanides
  La: AR, Ce: AR, Pr: AR, Nd: AR, Pm: AR, Sm: AR, Eu: AR, Gd: AR,
  Tb: AR, Dy: AR, Ho: AR, Er: AR, Tm: AR, Yb: AR, Lu: AR,
  // INFRA — transuranic actinides
  Ac: N2, Th: N2, Pa: N2, Np: N2, Pu: AR, Am: AR, Bk: AR,
  Cf: H2, Es: N2, Fm: O2, Md: N2, No: O2, Lr: N2, Rf: N2,
  Sg: N2, Bh: N2, Hs: N2,
  // BOTS — light elements (use real gas family)
  H: H2, He: HE, Li: H2, C: CO2, O: O2, N: N2, Ne: NE,
  Si: CO2, S: O2, Cl: O2, Ti: AR, V: AR, Cr: AR,
  Fe: AR, Cu: AR, Ag: AR, Sb: N2, Au: AR, Hg: AR, Pb: AR, U: N2,
};

const DEFAULT_GAS = AR;

/**
 * Look up the characteristic gas for an element symbol.
 * @param {string} symbol — element symbol (e.g. 'La', 'H', 'Pu')
 * @returns {{ color: string, label: string, bubbleRate: number }}
 */
export function getElementGas(symbol) {
  const color = GAS_BY_SYMBOL[symbol] || DEFAULT_GAS;
  const label =
    color === AR ? 'Ar' :
    color === N2 ? 'N₂' :
    color === H2 ? 'H₂' :
    color === O2 ? 'O₂' :
    color === HE ? 'He' :
    color === CO2 ? 'CO₂' :
    color === NE ? 'Ne' : 'Ar';
  // Ar bubbles slowly (inert atmosphere), H2/O2 faster (reactive)
  const bubbleRate = color === AR || color === N2 ? 0.6 : 1.0;
  return { color, label, bubbleRate };
}

export const SCHLENK_GAS_PALETTE = { AR, N2, H2, O2, HE, CO2, NE };
