// SCHLENK port state derivation
// Each manifold port has a stopcock whose handle angle reflects the aggregate
// health of services on that port's zone:
//   UP (angle 0°)       = Ar selected (healthy, inert atmosphere)
//   HORIZONTAL (90°)    = closed (degrading or indeterminate)
//   DOWN (180°)         = VAC selected (evacuating / failing)
//
// Input shape: statsMap = { [serviceId]: { level: 0-100, online: bool } }
// Zone → port mapping comes from zoneLayout.ZONES[zone].portId
// Service → zone mapping comes from serviceLayout.SERVICE_TO_ZONE

import { ZONES } from './zoneLayout.js';
import { SERVICE_TO_ZONE } from './serviceLayout.js';

export function computePortAngles(statsMap = {}) {
  // Aggregate health per zone
  const zoneHealth = {};
  for (const [svc, stats] of Object.entries(statsMap)) {
    const zone = SERVICE_TO_ZONE[svc];
    if (!zone) continue;
    if (!zoneHealth[zone]) zoneHealth[zone] = { total: 0, online: 0, loadSum: 0 };
    zoneHealth[zone].total += 1;
    if (stats?.online !== false) zoneHealth[zone].online += 1;
    zoneHealth[zone].loadSum += Number(stats?.level) || 0;
  }

  // Map each port to an angle
  const portAngles = {};
  for (const [zoneKey, zone] of Object.entries(ZONES)) {
    // BOTS zone has no aggregate health model — always render stopcock "up" (healthy) by default
    if (zoneKey === 'BOTS') {
      portAngles[zone.portId] = 0;
      continue;
    }
    const h = zoneHealth[zoneKey];
    if (!h || h.total === 0) {
      portAngles[zone.portId] = 90; // horizontal = unknown
      continue;
    }
    const onlineRatio = h.online / h.total;
    const avgLoad = h.loadSum / h.total;
    let angle;
    if (onlineRatio < 0.5) {
      angle = 180; // more offline than on — vacuum pull
    } else if (onlineRatio < 0.95 || avgLoad > 85) {
      angle = 90;  // partial failure / high load — closed/degrading
    } else {
      angle = 0;   // all healthy, inert atmosphere
    }
    portAngles[zone.portId] = angle;
  }
  return portAngles;
}

/** Aggregate scene-wide load % (0-100) from statsMap — feeds the pressure gauge. */
export function computeAggregateLoad(statsMap = {}) {
  const entries = Object.values(statsMap);
  if (!entries.length) return 0;
  const sum = entries.reduce((a, s) => a + (Number(s?.level) || 0), 0);
  return Math.min(100, Math.round(sum / entries.length));
}
