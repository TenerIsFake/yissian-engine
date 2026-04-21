// SCHLENK — Glassware shape registry
// Each entry defines an SVG path for one piece of lab glassware.
// Shapes are populated in Sprint 2 Tasks 2-4.
//
// Shape entry contract:
//   viewBox: '0 0 W H' — SVG viewBox for this shape
//   path: 'M...Z' — single SVG path string describing the silhouette outline
//   jointX, jointY: number — coordinates of the top ground-glass joint (where tubing enters)
//   liquidTop, liquidBottom: number — y-coords bounding where liquid fill renders
//   sidearm: bool — true if shape has a sidearm stopcock (affects text overlay position)

export const SHAPES = {
  'rbf-1neck': {
    viewBox: '0 0 80 120',
    path: 'M 34 8 L 34 42 C 14 48 6 78 22 100 C 30 116 56 116 64 100 C 80 78 72 48 52 42 L 52 8 Z',
    jointX: 43, jointY: 8,
    liquidTop: 50, liquidBottom: 114,
    sidearm: false,
  },
  'rbf-2neck': {
    viewBox: '0 0 90 120',
    path: 'M 20 14 L 20 30 L 32 40 L 32 44 C 12 50 6 80 22 100 C 32 114 60 114 70 100 C 86 80 80 50 60 44 L 60 40 L 72 30 L 72 14 L 60 14 L 60 24 L 52 32 L 40 32 L 32 24 L 32 14 Z',
    jointX: 46, jointY: 14,
    liquidTop: 50, liquidBottom: 113,
    sidearm: false,
  },
  'rbf-3neck': {
    viewBox: '0 0 100 120',
    path: 'M 16 14 L 16 28 L 28 38 L 28 44 C 10 52 4 82 22 102 C 34 116 66 116 78 102 C 96 82 90 52 72 44 L 72 38 L 84 28 L 84 14 L 72 14 L 72 22 L 60 30 L 54 30 L 54 14 L 46 14 L 46 30 L 40 30 L 28 22 L 28 14 Z',
    jointX: 50, jointY: 14,
    liquidTop: 52, liquidBottom: 115,
    sidearm: false,
  },
  'schlenk-sidearm': {
    viewBox: '0 0 100 120',
    path: 'M 30 8 L 30 40 C 10 46 2 78 18 100 C 28 116 54 116 64 100 C 78 82 76 52 56 44 L 56 34 L 96 34 L 96 24 L 56 24 L 56 8 Z',
    jointX: 43, jointY: 8,
    liquidTop: 50, liquidBottom: 114,
    sidearm: true,
  },
  'long-schlenk': {
    viewBox: '0 0 70 120',
    path: 'M 16 8 L 16 14 L 8 20 L 8 30 L 16 30 L 16 102 C 16 114 54 114 54 102 L 54 30 L 62 30 L 62 20 L 54 14 L 54 8 Z',
    jointX: 35, jointY: 8,
    liquidTop: 35, liquidBottom: 112,
    sidearm: true,
  },
  'fischer-porter': {
    viewBox: '0 0 80 120',
    path: 'M 26 8 L 26 20 L 14 24 L 14 32 L 26 32 L 26 96 C 26 110 54 110 54 96 L 54 32 L 66 32 L 66 24 L 54 20 L 54 8 Z',
    jointX: 40, jointY: 8,
    liquidTop: 36, liquidBottom: 108,
    sidearm: true,
  },
  'pear-flask': {
    viewBox: '0 0 80 120',
    path: 'M 34 8 L 34 28 C 20 36 10 66 22 96 C 30 114 52 114 60 96 C 72 66 62 36 48 28 L 48 8 Z',
    jointX: 41, jointY: 8,
    liquidTop: 36, liquidBottom: 112,
    sidearm: false,
  },
  'j-young': {
    viewBox: '0 0 70 120',
    path: 'M 22 4 L 48 4 L 48 14 L 46 14 L 46 22 L 44 22 L 44 104 C 44 114 26 114 26 104 L 26 22 L 24 22 L 24 14 L 22 14 Z',
    jointX: 35, jointY: 4,
    liquidTop: 28, liquidBottom: 112,
    sidearm: false,
  },
  'rotovap-bump': {
    viewBox: '0 0 90 120',
    path: 'M 30 6 L 30 18 C 20 22 18 34 28 40 L 28 46 L 34 46 L 34 51 C 18 61 12 85 24 99 C 34 109 50 109 60 99 C 72 85 66 61 50 51 L 50 46 L 52 46 L 52 40 C 62 34 60 22 50 18 L 50 6 Z',
    jointX: 40, jointY: 6,
    liquidTop: 60, liquidBottom: 107,
    sidearm: false,
  },
  'kjeldahl': {
    viewBox: '0 0 80 120',
    path: 'M 36 6 L 36 50 C 20 60 14 90 24 108 C 32 118 52 118 58 108 C 68 90 62 60 46 50 L 46 6 Z',
    jointX: 41, jointY: 6,
    liquidTop: 58, liquidBottom: 116,
    sidearm: false,
  },

  // ─── Condensers ───
  'dimroth': {
    viewBox: '0 0 70 140',
    path: 'M 20 10 L 50 10 L 50 120 L 20 120 Z',
    jointX: 35, jointY: 10,
    liquidTop: 12, liquidBottom: 118,
    sidearm: false,
  },
  'liebig': {
    viewBox: '0 0 70 140',
    path: 'M 20 10 L 50 10 L 50 120 L 20 120 Z',
    jointX: 35, jointY: 10,
    liquidTop: 12, liquidBottom: 118,
    sidearm: false,
  },
  'allihn': {
    viewBox: '0 0 70 140',
    path: 'M 20 10 L 50 10 L 50 120 L 20 120 Z',
    jointX: 35, jointY: 10,
    liquidTop: 12, liquidBottom: 118,
    sidearm: false,
  },
  'cold-finger': {
    viewBox: '0 0 70 140',
    path: 'M 18 14 L 52 14 L 52 104 C 52 120 18 120 18 104 Z',
    jointX: 35, jointY: 14,
    liquidTop: 20, liquidBottom: 115,
    sidearm: false,
  },

  // ─── Distillation & Traps ───
  'dean-stark': {
    viewBox: '0 0 90 120',
    path: 'M 40 6 L 40 30 L 22 40 L 22 82 L 40 90 L 40 100 C 40 114 62 114 62 100 L 62 90 L 80 82 L 80 40 L 62 30 L 62 6 Z',
    jointX: 51, jointY: 6,
    liquidTop: 45, liquidBottom: 112,
    sidearm: true,
  },
  'soxhlet': {
    viewBox: '0 0 80 140',
    path: 'M 30 6 L 30 30 L 18 36 L 18 88 L 30 94 L 30 104 L 50 104 L 50 94 L 62 88 L 62 36 L 50 30 L 50 6 Z',
    jointX: 40, jointY: 6,
    liquidTop: 40, liquidBottom: 102,
    sidearm: false,
  },
  'cold-trap': {
    viewBox: '0 0 90 140',
    path: 'M 10 30 L 10 118 C 10 130 80 130 80 118 L 80 30 Z',
    jointX: 45, jointY: 30,
    liquidTop: 40, liquidBottom: 124,
    sidearm: true,
  },
  'kugelrohr': {
    viewBox: '0 0 130 80',
    path: 'M 6 40 A 14 14 0 1 1 34 40 A 14 14 0 1 1 62 40 A 14 14 0 1 1 90 40 A 14 14 0 1 1 118 40 A 14 14 0 1 1 126 40 L 126 42 A 14 14 0 1 1 90 42 A 14 14 0 1 1 62 42 A 14 14 0 1 1 34 42 A 14 14 0 1 1 6 40 Z',
    jointX: 66, jointY: 26,
    liquidTop: 30, liquidBottom: 52,
    sidearm: false,
  },
  'sublimation': {
    viewBox: '0 0 80 130',
    path: 'M 14 20 L 14 108 C 14 120 66 120 66 108 L 66 20 Z',
    jointX: 40, jointY: 20,
    liquidTop: 28, liquidBottom: 114,
    sidearm: false,
  },

  // ─── Ancillary (utilities + bots) ───
  'addition-funnel': {
    viewBox: '0 0 80 140',
    path: 'M 24 16 L 24 70 L 36 90 L 36 112 L 44 112 L 44 90 L 56 70 L 56 16 Z',
    jointX: 40, jointY: 16,
    liquidTop: 20, liquidBottom: 88,
    sidearm: true,
  },
  'separatory': {
    viewBox: '0 0 80 140',
    path: 'M 20 20 L 20 40 C 12 50 14 80 30 96 L 36 112 L 44 112 L 50 96 C 66 80 68 50 60 40 L 60 20 Z',
    jointX: 40, jointY: 20,
    liquidTop: 26, liquidBottom: 108,
    sidearm: false,
  },
  'buchner-filter': {
    viewBox: '0 0 80 140',
    path: 'M 16 12 L 16 34 L 32 34 L 32 48 L 34 60 L 18 120 L 62 120 L 46 60 L 48 48 L 48 34 L 64 34 L 64 12 Z',
    jointX: 40, jointY: 12,
    liquidTop: 70, liquidBottom: 118,
    sidearm: true,
  },
  'nmr-tube': {
    viewBox: '0 0 60 140',
    path: 'M 22 10 L 38 10 L 38 14 L 36 14 L 36 124 C 36 132 24 132 24 124 L 24 14 L 22 14 Z',
    jointX: 30, jointY: 10,
    liquidTop: 30, liquidBottom: 130,
    sidearm: false,
  },
  'hg-bubbler': {
    viewBox: '0 0 80 140',
    path: 'M 16 14 L 16 100 C 16 118 46 118 46 100 L 46 44 L 64 44 L 64 14 L 60 14 L 60 40 L 42 40 L 42 100 C 42 112 20 112 20 100 L 20 14 Z',
    jointX: 30, jointY: 14,
    liquidTop: 78, liquidBottom: 110,
    sidearm: false,
  },
};

export function getShape(id) {
  return SHAPES[id] || null;
}

export function hasShape(id) {
  return id in SHAPES;
}
