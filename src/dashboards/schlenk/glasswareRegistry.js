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

export const SHAPES = {};

export function getShape(id) {
  return SHAPES[id] || null;
}

export function hasShape(id) {
  return id in SHAPES;
}
