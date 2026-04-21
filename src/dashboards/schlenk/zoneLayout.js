// SCHLENK bench scene zone bounds (1000×660 viewBox)
// Each zone is a rectangle with dashed border where service glassware renders.
// Port N above each zone feeds tubing down into that zone.

export const SCENE_W = 1000;
export const SCENE_H = 660;
export const MANIFOLD_H = 90;   // y=0..90 = manifold strip
export const BOTS_Y = 520;      // BOTS zone starts here, full width

export const ZONES = {
  MEDIA:    { x: 30,  y: 120, w: 230, h: 380, portId: 'P1', label: 'MEDIA · P1' },
  LIBRARY:  { x: 275, y: 120, w: 200, h: 380, portId: 'P2', label: 'LIBRARY · P2' },
  PIPELINE: { x: 490, y: 120, w: 190, h: 220, portId: 'P3', label: 'PIPELINE · P3' },
  INFRA:    { x: 695, y: 120, w: 275, h: 200, portId: 'P4', label: 'INFRA · P4' },
  TOOLS:    { x: 490, y: 360, w: 480, h: 140, portId: 'P5', label: 'TOOLS · P5' },
  BOTS:     { x: 30,  y: BOTS_Y, w: 940, h: 120, portId: 'P6', label: 'BOTS · P6 · NMR RACK' },
};

/** X-coordinate of each manifold port (in scene coords). Port 1-6 spans evenly. */
export const PORT_X = {
  P1: 145,
  P2: 375,
  P3: 585,
  P4: 833,
  P5: 730,
  P6: 500,
};

/** Returns the zone entry for a given zone key, or undefined. */
export function getZone(zoneKey) {
  return ZONES[zoneKey];
}

/** Returns [zoneKey, zoneEntry] pairs for iteration. */
export function listZones() {
  return Object.entries(ZONES);
}
