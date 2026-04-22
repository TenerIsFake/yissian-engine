// src/dashboards/schlenk/castLayout.js
// Positional constants for SCHLENK cast scene (viewBox 1400x660).
// All coordinates in SVG viewBox units.

export const CAST_W = 1400;
export const CAST_H = 660;

// Manifold strip occupies y=0..110
export const STRIP_H = 110;

// Ar + Vac line Y positions inside the strip
export const AR_Y = 70;
export const VAC_Y = 85;

// SRV-1 manifold extends x=30..640 (610 wide)
export const SRV1_MANIFOLD = { x1: 30, x2: 640 };
// SRV-2 manifold extends x=760..1370 (mirror, 610 wide)
export const SRV2_MANIFOLD = { x1: 760, x2: 1370 };

// Coupling gap x=640..760 (120 wide) hosts lecture bottles + manometer taps
export const COUPLING = { x1: 640, x2: 760, cx: 700 };

// Apparatus X positions per server (4 items, evenly spaced above manifold)
// Chemistry order: C tank (outer, feeds Ar) → Pirani → Cold trap → Vac pump (inner, near coupling)
export const SRV1_APPARATUS = {
  cTank: 100,
  pirani: 250,
  coldTrap: 400,
  vacPump: 550,
};
// SRV-2 mirrored: pump inner → trap → pirani → C outer
export const SRV2_APPARATUS = {
  vacPump: 850,
  coldTrap: 1000,
  pirani: 1150,
  cTank: 1300,
};

// 6 evenly-spaced stopcocks per manifold at ~87px intervals
// Zone stopcocks are INSIDE their zone's x-range so trunks drop straight.
export const SRV1_STOPCOCKS = {
  M: 117,   // zone: MEDIA-1 (x=10..320)
  J: 204,   // shared: J bottle
  I: 291,   // zone: INFRA-1 trunk (drops through gutter between MEDIA-1 & LIBRARY-1)
  L: 379,   // zone: LIBRARY-1 (x=330..640)
  Q: 466,   // shared: Q bottle
  T: 553,   // shared: T bottle
};
export const SRV2_STOPCOCKS = {
  T: 847,   // shared: T bottle mirror (1400-553)
  I2: 934,  // zone: INFRA-2 (x=760..1070)
  Q: 1021,  // shared: Q bottle mirror
  T2: 1109, // zone: TOOLS-2 trunk (drops through gutter between INFRA-2 & MEDIA-2)
  M2: 1196, // zone: MEDIA-2 (x=1080..1390)
  J: 1283,  // shared: J bottle mirror
};

// Zone bounds — each zone contains its trunk stopcock's X for straight-drop trunks
export const SRV1_ZONES = {
  MEDIA:   { x: 10,  y: 115, w: 310, h: 325, trunkX: 117, subHeaderY: 135 },
  LIBRARY: { x: 330, y: 115, w: 310, h: 325, trunkX: 379, subHeaderY: 135 },
  INFRA:   { x: 10,  y: 455, w: 630, h: 85,  trunkX: 291, subHeaderY: 470 },
};
export const SRV2_ZONES = {
  INFRA:   { x: 760,  y: 115, w: 310, h: 325, trunkX: 934,  subHeaderY: 135 },
  MEDIA:   { x: 1080, y: 115, w: 310, h: 325, trunkX: 1196, subHeaderY: 135 },
  TOOLS:   { x: 760,  y: 455, w: 630, h: 85,  trunkX: 1109, subHeaderY: 470 },
};

// Lecture bottle positions (y fixed per bottle; x centered at COUPLING.cx)
export const LECTURE_BOTTLES = {
  J: { gas: 'NO2', drive: 'J', y: 120, srv1Stopcock: 204, srv2Stopcock: 1283 },
  Q: { gas: 'I2',  drive: 'Q', y: 220, srv1Stopcock: 466, srv2Stopcock: 1021 },
  T: { gas: 'Cl2', drive: 'T', y: 320, srv1Stopcock: 553, srv2Stopcock: 847  },
};

// Manometer position (centered at COUPLING.cx, v6 dimensions 80w x 75h)
export const MANOMETER = {
  cx: 700,
  legLeftX: 672,
  legRightX: 728,
  topY: 460,
  bottomY: 535,
};
