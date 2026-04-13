// ── Mode Icon Registry ──────────────────────────────────────────
// Each mode defines up to 12 SVG icon paths that can be rendered
// on cards, grids, or diagrams. Paths are simple monochrome shapes
// designed for 24x24 viewBox. Modes reference icons by category.
//
// Usage: import { getModeIcon } from './modeIcons';
//        const path = getModeIcon('SAFARI', 'ALKALI');

const ICON_SETS = {
  CHEM: {
    ALKALI: 'M6 20V8h4v12h2V6H4v14h2zm8-14v14h4V6h-4z', // flask
    ALKALINE: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14l-4-4h8l-4 4z', // beaker
    TRANSITION: 'M4 4h16v2H4V4zm2 4h12v2H6V8zm4 4h4v8h-4v-8z', // test tube
    HALOGEN: 'M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z', // erlenmeyer
  },
  SPACE: {
    ALKALI: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z', // star
    ALKALINE: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z', // planet ring
    TRANSITION: 'M12 6l-6 6 6 6 6-6-6-6z', // diamond/crystal
    HALOGEN: 'M2 12h4l3-8 6 16 3-8h4', // signal wave
  },
  TACTICAL: {
    ALKALI: 'M12 2l-2 4-4-1 1 4-3 3 4 0 0 4 4-1-1 4 3-3 0-4-4 0z', // crosshair
    ALKALINE: 'M3 3h18v18H3V3zm2 2v14h14V5H5z', // target box
    TRANSITION: 'M12 2v4m0 12v4M2 12h4m12 0h4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83', // radar
    HALOGEN: 'M4 4l16 16M4 20L20 4', // X mark
  },
  SAFARI: {
    ALKALI: 'M12 4c-1 0-3 2-3 4s1 3 3 5c2-2 3-3 3-5s-2-4-3-4zm-4 12c0 2 2 4 4 4s4-2 4-4', // paw
    ALKALINE: 'M8 4c-2 0-4 2-4 5s2 5 4 5h8c2 0 4-2 4-5s-2-5-4-5H8z', // tree
    TRANSITION: 'M12 2C8 2 4 5 4 9c0 6 8 13 8 13s8-7 8-13c0-4-4-7-8-7z', // location pin
    HALOGEN: 'M4 12c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z', // sun
  },
  HEIST: {
    ALKALI: 'M5 10V7a7 7 0 0114 0v3h2v12H3V10h2zm2 0h10V7a5 5 0 00-10 0v3z', // lock
    ALKALINE: 'M12 1l3 6h7l-5.5 4 2 7L12 14l-6.5 4 2-7L2 7h7l3-6z', // diamond
    TRANSITION: 'M2 4h20v3H2V4zm1 5h18v10H3V9z', // briefcase
    HALOGEN: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z', // alert
  },
  AQUARIUM: {
    ALKALI: 'M18 10c0-3-2-6-6-6S6 7 6 10c-2 0-4 2-4 4h20c0-2-2-4-4-4z', // fish
    ALKALINE: 'M12 2c-5 0-10 4-10 10s5 10 10 10 10-4 10-10S17 2 12 2z', // bubble
    TRANSITION: 'M4 18c2-3 5-4 8-4s6 1 8 4', // wave
    HALOGEN: 'M12 4c-3 0-6 3-6 6 0 2 1 4 3 5l3 5 3-5c2-1 3-3 3-5 0-3-3-6-6-6z', // jellyfish
  },
  BLUEPRINT: {
    ALKALI: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h4v4H7V7z', // floor plan
    ALKALINE: 'M2 2h20v20H2V2zm4 4v12h12V6H6z', // frame
    TRANSITION: 'M12 2v20M2 12h20', // crosshair
    HALOGEN: 'M4 4h16M4 8h16M4 12h16M4 16h16M4 20h16', // ruler marks
  },
  NEURAL: {
    ALKALI: 'M12 2a3 3 0 100 6 3 3 0 000-6zm-7 8a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4zm-7 6a3 3 0 100 6 3 3 0 000-6z', // nodes
    ALKALINE: 'M4 12h4m8 0h4M12 4v4m0 8v4M7 7l3 3m4 4l3 3M17 7l-3 3m-4 4l-3 3', // synapse
    TRANSITION: 'M12 8a4 4 0 100 8 4 4 0 000-8zm0-6v4m0 12v4m-8-10h4m8 0h4', // neuron
    HALOGEN: 'M2 12c3-6 7-6 10 0s7 6 10 0', // brain wave
  },
  ARCANE: {
    ALKALI: 'M12 2l-2 6-6 2 6 2 2 6 2-6 6-2-6-2-2-6z', // 4-point star
    ALKALINE: 'M12 2l4 8 8 2-6 6 1 8-7-4-7 4 1-8-6-6 8-2z', // pentacle
    TRANSITION: 'M12 4l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z', // rune
    HALOGEN: 'M12 2C8 2 4 6 4 12c0 4 3 7 8 10 5-3 8-6 8-10 0-6-4-10-8-10z', // eye
  },
  BIO: {
    ALKALI: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12z', // cell
    ALKALINE: 'M12 2c-2 4-6 6-10 6 0 4 2 8 6 10 2-4 6-6 10-6 0-4-2-8-6-10z', // mitosis
    TRANSITION: 'M8 4c-3 0-6 4-6 8s3 8 6 8c2 0 3-2 4-4 1 2 2 4 4 4 3 0 6-4 6-8s-3-8-6-8z', // DNA helix
    HALOGEN: 'M12 6a3 3 0 100 6 3 3 0 000-6zm-6 6a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z', // organelle
  },
  MOLECULE: {
    ALKALI: 'M8 8a3 3 0 100 6 3 3 0 000-6zm8 2a2 2 0 100 4 2 2 0 000-4zM11 11l5 1', // bond
    ALKALINE: 'M12 4a2 2 0 100 4 2 2 0 000-4zM6 14a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zM12 8v6m-5 1l4-1m2 0l4 1', // trigonal
    TRANSITION: 'M12 2a2 2 0 100 4 2 2 0 000-4zm0 16a2 2 0 100 4 2 2 0 000-4zM4 10a2 2 0 100 4 2 2 0 000-4zm16 0a2 2 0 100 4 2 2 0 000-4z', // ring
    HALOGEN: 'M6 6l12 12M6 18L18 6M12 4v16M4 12h16', // orbital
  },
  PLANET: {
    ALKALI: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-8 10h16', // planet
    ALKALINE: 'M12 4a8 8 0 100 16 8 8 0 000-16zM4 12c2-2 5-3 8-3s6 1 8 3', // rings
    TRANSITION: 'M12 6a2 2 0 100 4 2 2 0 000-4zm-6 8a1 1 0 100 2 1 1 0 000-2zm12-2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z', // system
    HALOGEN: 'M12 6l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3L7 9h3l2-3z', // small star
  },
  WEATHER: {
    ALKALI: 'M6 16a6 6 0 1110-4H6a4 4 0 000 4z', // cloud
    ALKALINE: 'M12 2v3m7.07.93l-2.12 2.12M22 12h-3M19.07 19.07l-2.12-2.12M12 22v-3m-7.07-.93l2.12-2.12M2 12h3M4.93 4.93l2.12 2.12', // sun
    TRANSITION: 'M8 14l1 6m3-8l1 8m3-6l1 6M6 12a6 6 0 1110-4H6a4 4 0 000 0z', // rain
    HALOGEN: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z', // lightning
  },
  AIRPORT: {
    ALKALI: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', // plane
    ALKALINE: 'M4 4h16v3H4V4zm0 5h16v2H4V9zm0 4h8v2H4v-2zm0 4h12v2H4v-2z', // departure board
    TRANSITION: 'M12 2L8 8h8l-4-6zm0 20l4-6H8l4 6zM2 12l6-4v8l-6-4zm20 0l-6 4V8l6 4z', // compass
    HALOGEN: 'M4 20h16v-2H4v2zm2-4h12v-2H6v2zm-2-4h16v-2H4v2z', // tower
  },
  DINO: {
    ALKALI: 'M18 6c-2-2-5-2-7 0L4 12l2 2 3-3v7h2v-5l3 3 3-3v5h2v-7l3 3 2-2-6-6z', // fossil
    ALKALINE: 'M4 18h2l2-4h8l2 4h2l-3-6V8c0-2-2-4-4-4S9 6 9 8v4l-3 6h-2z', // bone
    TRANSITION: 'M8 4c-3 0-5 3-5 6 0 2 1 4 3 5l6 6 6-6c2-1 3-3 3-5 0-3-2-6-5-6s-5 3-5 6', // leaf fossil
    HALOGEN: 'M12 2C8 2 5 5 5 9c0 3 2 6 5 8h4c3-2 5-5 5-8 0-4-3-7-7-7z', // egg
  },
  NOIR: {
    ALKALI: 'M12 4C9 4 7 6 7 9c0 2 1 3 2 4H7l5 8 5-8h-2c1-1 2-2 2-4 0-3-2-5-5-5z', // detective hat
    ALKALINE: 'M6 2h12v20l-6-4-6 4V2z', // case file
    TRANSITION: 'M9 2h6v8l-3 2-3-2V2zm-3 18c0-3 3-5 6-5s6 2 6 5', // magnifier
    HALOGEN: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-2 6h4v6h-4V8zm0 8h4v2h-4v-2z', // spotlight
  },
  VINYL: {
    ALKALI: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 8a2 2 0 110 4 2 2 0 010-4z', // record
    ALKALINE: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 5a5 5 0 110 10 5 5 0 010-10z', // groove
    TRANSITION: 'M18 3l-2 2-2-2-2 2-2-2-2 2H4v16h16V3h-2zm-6 15a4 4 0 110-8 4 4 0 010 8z', // sleeve
    HALOGEN: 'M14 3l6 4v10l-6 4-6-4V7l6-4z', // speaker
  },
  BAND: {
    ALKALI: 'M12 3c-2 0-3 1-3 3v8a4 4 0 108 0V6c0-2-1-3-3-3zm-2 11V6h4v8a2 2 0 11-4 0z', // mic
    ALKALINE: 'M4 7h4v10H4V7zm6-3h4v16h-4V4zm6 5h4v8h-4V9z', // equalizer
    TRANSITION: 'M6 4a4 4 0 018 0v2H6V4zm-2 4h12v2H4V8zm0 4h12l-1 8H5L4 12z', // drum
    HALOGEN: 'M8 2v14l-4 2v2h16v-2l-4-2V2H8zm2 2h4v10h-4V4z', // guitar neck
  },
  PARTICLE: {
    ALKALI: 'M12 8a4 4 0 100 8 4 4 0 000-8zm-8 4a1 1 0 100 2 1 1 0 000-2zm16 0a1 1 0 100 2 1 1 0 000-2z', // atom
    ALKALINE: 'M12 4l-8 8 8 8 8-8-8-8zm0 4l4 4-4 4-4-4 4-4z', // collision
    TRANSITION: 'M4 4l4 4m8 8l4 4M20 4l-4 4m-8 8l-4 4M12 2v4m0 12v4M2 12h4m12 0h4', // tracks
    HALOGEN: 'M12 10a2 2 0 100 4 2 2 0 000-4zm0-8v6m0 8v6m-6-10h6m2 0h6', // boson
  },
  GLOBE: {
    ALKALI: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 5 6 5 10s-2 7-5 10c-3-3-5-6-5-10s2-7 5-10z', // globe
    ALKALINE: 'M4 4l4 2 4-2 4 2 4-2v16l-4-2-4 2-4-2-4 2V4z', // map fold
    TRANSITION: 'M12 2C8 2 4 5 4 9c0 6 8 13 8 13s8-7 8-13c0-4-4-7-8-7zm0 4a3 3 0 110 6 3 3 0 010-6z', // pin
    HALOGEN: 'M2 8l4 2 4-2 4 2 4-2 4 2v8l-4-2-4 2-4-2-4 2-4-2V8z', // terrain
  },
  FORGE: {
    ALKALI: 'M14 2l-4 8h4l-4 12 8-10h-5l5-10h-4z', // anvil spark
    ALKALINE: 'M8 2h8l-2 8h4L8 22l2-10H6l2-10z', // flame
    TRANSITION: 'M6 2h12v4l-4 4v4l4 4v4H6v-4l4-4v-4L6 6V2z', // ingot
    HALOGEN: 'M4 20h16l-3-6H7l-3 6zM8 8h8v6H8V8zm2-6h4v6h-4V2z', // hammer
  },
  OCEAN: {
    ALKALI: 'M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0', // wave
    ALKALINE: 'M12 4c-2 0-4 2-4 4 0 3 2 5 4 7 2-2 4-4 4-7 0-2-2-4-4-4zm0 2a2 2 0 110 4 2 2 0 010-4z', // shell
    TRANSITION: 'M6 6c1-2 3-4 6-4s5 2 6 4c-1 4-3 6-6 8C9 12 7 10 6 6zm6 10c-3 0-6 2-6 4h12c0-2-3-4-6-4z', // jellyfish
    HALOGEN: 'M4 8l2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3v10H4V8z', // coral
  },
  STEAM: {
    ALKALI: 'M12 2a4 4 0 014 4v2a2 2 0 012 2v4a2 2 0 01-2 2v2a4 4 0 01-8 0v-2a2 2 0 01-2-2v-4a2 2 0 012-2V6a4 4 0 014-4z', // pressure valve
    ALKALINE: 'M6 4h12l-1 4h-2l-1 4h-4L9 8H7L6 4zm1 14h10v2H7v-2zm2-4h6v2H9v-2z', // boiler
    TRANSITION: 'M12 2a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm-3 12h6v8H9v-8z', // gauge
    HALOGEN: 'M4 10h2l2-4h8l2 4h2v4l-2 2H6l-2-2v-4zm4 8h8v2H8v-2z', // piston
  },
  ARCADE: {
    ALKALI: 'M8 2h8v4l-2 2v4h-4V8L8 6V2zm2 14h4v6h-4v-6z', // joystick
    ALKALINE: 'M4 4h16v12H4V4zm2 2v8h12V6H6zm4 12h4v4h-4v-4z', // screen
    TRANSITION: 'M12 6a2 2 0 100 4 2 2 0 000-4zm-4 6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z', // buttons
    HALOGEN: 'M7 4h10l3 6-3 6H7l-3-6 3-6z', // power-up hex
  },
  APOTHECARY: {
    ALKALI: 'M10 2h4v4h4v4h-4v4H10v-4H6V6h4V2z', // mortar cross
    ALKALINE: 'M9 2h6v3l2 5v8c0 2-2 4-5 4s-5-2-5-4v-8l2-5V2z', // bottle
    TRANSITION: 'M8 4h8l-1 6c2 1 3 3 3 5 0 3-3 5-6 5s-6-2-6-5c0-2 1-4 3-5L8 4z', // phial
    HALOGEN: 'M12 2c-3 0-6 3-6 6 0 2 1 4 3 5v7h6v-7c2-1 3-3 3-5 0-3-3-6-6-6z', // candle
  },
  FUNHOUSE: {
    ALKALI: 'M12 2l2 4h4l-3 3 1 5-4-3-4 3 1-5-3-3h4l2-4z', // star burst
    ALKALINE: 'M12 4a8 8 0 100 16 8 8 0 000-16zm-3 5h6v2H9V9zm0 4h6v2H9v-2z', // smiley
    TRANSITION: 'M6 18l2-6 4 4 4-8 2 10', // roller coaster
    HALOGEN: 'M12 2l3 6-3 4 3 4-3 6-3-6 3-4-3-4 3-6z', // mirror zigzag
  },
  METRO: {
    ALKALI: 'M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v4h-4v-4z', // train front
    ALKALINE: 'M6 4h12v14l-2 2H8l-2-2V4zm2 2v6h8V6H8z', // station
    TRANSITION: 'M2 12h20M6 8v8m4-10v12m4-12v12m4-10v8', // tracks
    HALOGEN: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 8h8v8H8V8z', // map marker
  },
  GARDEN: {
    ALKALI: 'M12 2c-2 0-4 3-4 6 0 2 1 4 4 5v9h0c3-1 4-3 4-5 0-3-2-6-4-6z', // leaf
    ALKALINE: 'M12 4c-2 2-3 4-3 6a3 3 0 006 0c0-2-1-4-3-6zm0 10v8m-4-4h8', // flower
    TRANSITION: 'M12 22V10m-5 5c0-3 2-5 5-7 3 2 5 4 5 7m-10 0c-2-2-3-4-3-6 0-3 2-5 4-6m4 12c2-2 3-4 3-6 0-3-2-5-4-6', // tree
    HALOGEN: 'M8 20h8v-4c2-1 4-3 4-6 0-4-4-8-8-8s-8 4-8 8c0 3 2 5 4 6v4z', // pot
  },
  BREW: {
    ALKALI: 'M8 2h8v2l-1 4v6l1 4v2H8v-2l1-4V8L8 4V2z', // pint glass
    ALKALINE: 'M6 4h12v4c0 3-2 5-4 6v4c2 1 4 3 4 4H6c0-1 2-3 4-4v-4c-2-1-4-3-4-6V4z', // barrel
    TRANSITION: 'M10 2h4v4h3v4h-3v4h3v4h-3v4h-4v-4H7v-4h3v-4H7V6h3V2z', // tap
    HALOGEN: 'M8 6a4 4 0 018 0v2H8V6zm-2 4h12v8c0 2-2 4-6 4s-6-2-6-4v-8z', // fermenter
  },
  LIBRARY: {
    ALKALI: 'M4 4h2v16H4V4zm4 0h2v16H8V4zm4 2h2v14h-2V6zm4-2h2v16h-2V4z', // books
    ALKALINE: 'M6 2h12v20H6V2zm2 2v16h8V4H8zm2 2h4v3h-4V6z', // open book
    TRANSITION: 'M4 4h16v2H4V4zm0 4h12v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2z', // text lines
    HALOGEN: 'M8 2l4 4 4-4v20l-4-4-4 4V2z', // bookmark
  }
};

// Default icon set for modes without specific icons
const DEFAULT_ICONS = {
  ALKALI: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z',
  ALKALINE: 'M4 4h16v16H4V4zm2 2v12h12V6H6z',
  TRANSITION: 'M12 2l10 20H2L12 2z',
  HALOGEN: 'M12 6l-6 6 6 6 6-6-6-6z',
};

/**
 * Get the SVG path data for a mode's category icon.
 * Returns a path string for use in <path d="..."> within a 24x24 viewBox.
 */
export function getModeIcon(mode, category) {
  const modeSet = ICON_SETS[mode];
  if (modeSet && modeSet[category]) return modeSet[category];
  return DEFAULT_ICONS[category] || DEFAULT_ICONS.ALKALI;
}

/**
 * Get all icon paths for a mode (up to 12 categories).
 */
export function getModeIconSet(mode) {
  return ICON_SETS[mode] || DEFAULT_ICONS;
}

export default ICON_SETS;
