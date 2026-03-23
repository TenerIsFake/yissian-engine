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
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function saveResults(srv1Mbps, srv2Mbps) {
  const data = {
    srv1: { downloadMbps: srv1Mbps, timestamp: Date.now() },
    srv2: { downloadMbps: srv2Mbps, timestamp: Date.now() },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
