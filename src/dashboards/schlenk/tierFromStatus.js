// Compute tier from service status + zone assignment
// Priority: offline → t1, unknown → t2, error → t5, else zone default
// Zones: MEDIA/LIBRARY → t4 (reflux), PIPELINE/TOOLS/INFRA → t3 (argon), BOTS → t3 or t4 random

const ZONE_TIER = {
  MEDIA:    't4',
  LIBRARY:  't4',
  PIPELINE: 't3',
  TOOLS:    't3',
  INFRA:    't3',
};

function stableRandomTier(seed) {
  // Deterministic t3 or t4 based on seed string (bot id / symbol)
  let h = 0;
  for (let i = 0; i < (seed || '').length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (h % 2) === 0 ? 't3' : 't4';
}

/**
 * @param {{ stats: object, zone: string, seedId: string }} args
 * @returns {'t1'|'t2'|'t3'|'t4'|'t5'}
 */
export function getTierFromStatus({ stats, zone, seedId }) {
  // Error/unhealthy/unresponsive → t5
  if (stats?.error || stats?.unhealthy || stats?.unresponsive || stats?.isBoiling) return 't5';
  // Explicitly offline → t1
  if (stats?.online === false) return 't1';
  // No data / undefined online → t2 (unknown)
  if (!stats || stats.online === undefined && stats.level === undefined) return 't2';
  // Bot (no standard zone) → random t3/t4 by seed
  if (zone === 'BOTS' || !zone) return stableRandomTier(seedId || '');
  // Zone default
  return ZONE_TIER[zone] || 't3';
}
