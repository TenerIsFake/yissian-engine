// src/dashboards/schlenk/metricMappers.js
// Pure functions mapping metric values to visual animation parameters.
// Each function is side-effect-free and takes a single scalar (or tiny object) input.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** CPU% → Vac pump rotor animation duration in seconds. Higher CPU = faster spin. */
export function cpuToRotorDur(cpuPct) {
  const pct = clamp(cpuPct ?? 0, 0, 100);
  return Math.max(0.3, 3 * (1 - pct / 100));
}

/** RAM% → Pirani needle angle in degrees (-90=empty..+90=full). */
export function ramToNeedleAngle(ramPct) {
  const pct = clamp(ramPct ?? 0, 0, 100);
  return -90 + (pct / 100) * 180;
}

/** Drive fill% → liquid height in px for a tank of given total height. */
export function drivePctToLiquidHeight(fillPct, tankHeight) {
  const pct = clamp(fillPct ?? 0, 0, 100);
  return Math.round(tankHeight * (pct / 100));
}

/** Download Mbps → Ar line dash-offset animation duration in seconds. */
export function downloadToArDur(mbps) {
  const m = Math.max(1, mbps ?? 1);
  return Math.max(0.2, 3 / m);
}

/** Upload Mbps → Vac line dash-offset animation duration in seconds. */
export function uploadToVacDur(mbps) {
  const m = Math.max(1, mbps ?? 1);
  return Math.max(0.3, 2.5 / m);
}

/** Total net Mbps → Cold trap bubble rise animation duration in seconds. */
export function netToBubbleDur(netMbps) {
  const m = Math.max(1, netMbps ?? 1);
  return Math.max(0.4, 1.2 / (m / 100));  // bubbles faster for higher throughput
}

/** Speedtest ping ms → number of visible frost tick marks in cold trap (capped 0..5). */
export function pingToFrostCount(pingMs) {
  const ms = Math.max(0, pingMs ?? 0);
  return Math.min(5, Math.floor(ms / 5));
}

/** Load differential between two servers (CPU+RAM blend). Returns torr delta. */
export function loadDifferential({ cpu1 = 0, ram1 = 0, cpu2 = 0, ram2 = 0 }) {
  return (cpu1 + ram1) / 2 - (cpu2 + ram2) / 2;
}

/** Differential torr → Hg column vertical offset in px (clamped to ±20). */
export function differentialToMercuryOffset(deltaTorr) {
  return clamp((deltaTorr ?? 0) * 2, -20, 20);
}
