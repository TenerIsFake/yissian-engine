const STORAGE_KEY = 'speedtest_v2';
const STALE_MS = 24 * 3600 * 1000;
const TEST_URL_PATH = '/api/glances/api/4/processlist';
const TEST_URL_PATH2 = '/api/glances2/api/4/processlist';
const MIN_BYTES = 10 * 1024; // 10 KB minimum to consider a valid test
const RUNS = 3;

export function loadStoredResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Return latest entry from each server's history array
    const srv1Arr = Array.isArray(parsed.srv1) ? parsed.srv1 : [];
    const srv2Arr = Array.isArray(parsed.srv2) ? parsed.srv2 : [];
    const last1 = srv1Arr[srv1Arr.length - 1];
    const last2 = srv2Arr[srv2Arr.length - 1];
    return {
      srv1: last1 ? { downloadMbps: last1.mbps, timestamp: last1.ts } : null,
      srv2: last2 ? { downloadMbps: last2.mbps, timestamp: last2.ts } : null,
    };
  } catch (_) {
    return null;
  }
}

export function saveResults(srv1Mbps, srv2Mbps) {
  const now = Date.now();
  let existing = { srv1: [], srv2: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate from old single-object format to array format
      existing.srv1 = Array.isArray(parsed.srv1) ? parsed.srv1 : [];
      existing.srv2 = Array.isArray(parsed.srv2) ? parsed.srv2 : [];
    }
  } catch (_) {}
  if (srv1Mbps != null) existing.srv1.push({ ts: now, mbps: srv1Mbps });
  if (srv2Mbps != null) existing.srv2.push({ ts: now, mbps: srv2Mbps });
  // Keep last 10 entries per server
  existing.srv1 = existing.srv1.slice(-10);
  existing.srv2 = existing.srv2.slice(-10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (_) {}
}

export function isStale(timestamp) {
  return Date.now() - timestamp > STALE_MS;
}

export async function runSpeedTestForServer(urlPath, signal) {
  let totalBytes = 0;
  let totalMs = 0;

  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    let res;
    try {
      res = await fetch(`${urlPath}?_=${Date.now()}`, { signal, cache: 'no-store' });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const elapsed = performance.now() - start;
      if (buf.byteLength < MIN_BYTES) return null;
      totalBytes += buf.byteLength;
      totalMs += elapsed;
    } catch (_) {
      return null;
    }
  }

  if (totalMs === 0) return null;
  const downloadMbps = (totalBytes * 8) / (totalMs / 1000) / 1e6;
  return { downloadMbps };
}

export const SRV1_PATH = TEST_URL_PATH;
export const SRV2_PATH = TEST_URL_PATH2;
