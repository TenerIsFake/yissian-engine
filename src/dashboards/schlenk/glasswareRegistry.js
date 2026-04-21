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
};

export function getShape(id) {
  return SHAPES[id] || null;
}

export function hasShape(id) {
  return id in SHAPES;
}
