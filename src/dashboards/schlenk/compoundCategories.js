// SCHLENK — category palette (real compound colors, from category-compounds.html mockup)
// Replaces the gas-coded category palette from Phase 0. Each category references a
// specific inorganic/organic/coordination compound, not a generic gas type.
//
// Shape per category: { bg, border, text, glow, compound } — matches the structure
// consumed by createModeTiers() paletteHelpers.js intensifyPalette().

export const COMPOUND_CATEGORIES = {
  ALKALI: {
    bg: 'rgba(209,69,69,0.08)', border: '#D14545', text: '#E88888', glow: 'rgba(209,69,69,0.35)',
    compound: 'Li flame test (crimson)',
  },
  ALKALINE: {
    bg: 'rgba(168,209,96,0.08)', border: '#A8D160', text: '#B8E080', glow: 'rgba(168,209,96,0.32)',
    compound: 'BaCl₂ flame (pale green)',
  },
  TRANSITION: {
    bg: 'rgba(59,151,212,0.08)', border: '#3B97D4', text: '#68B0E0', glow: 'rgba(59,151,212,0.35)',
    compound: 'CuSO₄·5H₂O (azure)',
  },
  HALOGEN: {
    bg: 'rgba(122,58,160,0.08)', border: '#7A3AA0', text: '#9B60C0', glow: 'rgba(122,58,160,0.35)',
    compound: 'I₂ vapor (iodine violet)',
  },
  NOBLE: {
    bg: 'rgba(176,139,232,0.08)', border: '#B08BE8', text: '#C4A8F0', glow: 'rgba(176,139,232,0.35)',
    compound: 'Ar plasma (argon lilac)',
  },
  LANTHANIDE: {
    bg: 'rgba(192,115,168,0.10)', border: '#C073A8', text: '#D498C0', glow: 'rgba(192,115,168,0.40)',
    compound: 'NdCl₃·6H₂O (Nd rose)',
  },
  POST: {
    bg: 'rgba(61,67,77,0.08)', border: '#3D434D', text: '#6A6F78', glow: 'rgba(61,67,77,0.30)',
    compound: 'PbS (galena)',
  },
  METALLOID: {
    bg: 'rgba(110,121,133,0.08)', border: '#6E7985', text: '#94A0AC', glow: 'rgba(110,121,133,0.28)',
    compound: 'Si wafer (silicon grey)',
  },
  NONMETAL: {
    bg: 'rgba(29,78,142,0.08)', border: '#1D4E8E', text: '#4A7AB8', glow: 'rgba(29,78,142,0.30)',
    compound: 'Prussian blue Fe₄[Fe(CN)₆]₃',
  },
  ACTINIDE: {
    bg: 'rgba(200,219,60,0.10)', border: '#C8DB3C', text: '#D8E870', glow: 'rgba(200,219,60,0.40)',
    compound: 'Uranyl UO₂²⁺ fluorescence',
  },
  PNICTOGEN: {
    bg: 'rgba(168,55,37,0.08)', border: '#A83725', text: '#C86050', glow: 'rgba(168,55,37,0.32)',
    compound: 'Red phosphorus (oxblood)',
  },
  CHALCOGEN: {
    bg: 'rgba(224,196,50,0.08)', border: '#E0C432', text: '#EAD368', glow: 'rgba(224,196,50,0.38)',
    compound: 'S₈ rhombic (sulfur yellow)',
  },
};
