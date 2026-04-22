import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadStoredResults, saveResults, runSpeedTestForServer, isStale, SRV1_PATH, SRV2_PATH } from '../speedtest.js';
import { apiFetch } from '../utils/apiClient.js';
import CoordComplex from '../dashboards/chem/CoordComplex.jsx';
import OrbitalDiagram from '../dashboards/chem/OrbitalDiagram.jsx';
import JablonskiDiagram from '../dashboards/chem/JablonskiDiagram.jsx';
import SpeedtestSparkline from '../dashboards/chem/SpeedtestSparkline.jsx';
import '../dashboards/schlenk/SchlenkMetricGlow.css';

const MONO = 'monospace';

// ─────────────────────────────────────────────
// NH-68 — Disk Trend Sparklines
// ─────────────────────────────────────────────
const DRIVE_COLORS = { '/mnt/c': '#74b9ff', 'c:': '#74b9ff', '/mnt/j': '#55efc4', 'j:': '#55efc4', '/mnt/q': '#fdcb6e', 'q:': '#fdcb6e', '/mnt/t': '#a29bfe', 't:': '#a29bfe' };
const DRIVE_LABELS = { '/mnt/c': 'C:', 'c:': 'C:', '/mnt/j': 'J:', 'j:': 'J:', '/mnt/q': 'Q:', 'q:': 'Q:', '/mnt/t': 'T:', 't:': 'T:' };

function linReg(points) {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += points[i]; sxy += i * points[i]; sxx += i * i; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  if (slope <= 0) return null; // not filling up
  const daysTo100 = Math.ceil((100 - intercept) / slope);
  return daysTo100 > 0 ? daysTo100 : null;
}

function DiskTrendSparkline() {
  const { data } = useQuery({
    queryKey: ['disk-trend'],
    queryFn: () => apiFetch('/api/flask/disk-trend'),
    refetchInterval: 3600_000,
  });

  if (!data || data.length < 2) return null;

  // Group by drive mount across all snapshots
  const driveMap = {};
  for (const snap of data) {
    for (const d of snap.drives || []) {
      const key = d.mount;
      if (!driveMap[key]) driveMap[key] = [];
      driveMap[key].push(d.percent);
    }
  }

  const drives = Object.entries(driveMap).filter(([k]) => DRIVE_LABELS[k]);

  if (drives.length === 0) return null;

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
        DISK_TREND ({data.length}d)
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {drives.map(([mount, points]) => {
          const color = DRIVE_COLORS[mount] || '#aaa';
          const label = DRIVE_LABELS[mount];
          const daysToFull = linReg(points);
          const w = 60, h = 20;
          const max = 100, min = 0;
          const pathD = points.map((v, i) => {
            const x = (i / (points.length - 1)) * w;
            const y = h - ((v - min) / (max - min)) * h;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');

          return (
            <div key={mount} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 7, color, minWidth: 14 }}>{label}</span>
              <svg width={w} height={h} style={{ overflow: 'visible' }}>
                <path d={pathD} fill="none" stroke={color} strokeWidth={1.2} opacity={0.7} />
              </svg>
              <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                {points[points.length - 1]?.toFixed(0)}%
              </span>
              {daysToFull && daysToFull < 365 && (
                <span style={{ fontFamily: MONO, fontSize: 6, color: daysToFull < 30 ? '#f87171' : daysToFull < 90 ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
                  ~{daysToFull}d
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const defaultStats = () => ({ level: 0, isBoiling: false, online: false, details: [] });

// ─────────────────────────────────────────────
// SYSTEM METRICS PANEL
// ─────────────────────────────────────────────
const DEFAULT_SECTION_LABELS = { srv1: '◆ SRV-1 ◆ Coordination_Complex', storage: '◆ Storage_Drives ◆ Orbital_Fill_Diagram', srv2: '◆ SRV-2 ◆ Coordination_Complex' };
const DEFAULT_GLANCES_LABELS = { cpu: 'CPU_LOAD', ram: 'RAM_USAGE', netDown: 'NET_DOWN', netUp: 'NET_UP' };
const DEFAULT_STORAGE_LABELS = { srv1: 'SRV-1', tv: 'TV', movies: 'MOVIES', musicPhotos: 'MUSIC_PHOTOS', srv2: 'SRV-2' };

export const SystemMetricsPanel = ({ addLog, transcodingActive, plexStatsLevel, sectionLabels = DEFAULT_SECTION_LABELS, glancesLabels = DEFAULT_GLANCES_LABELS, storageLabels = DEFAULT_STORAGE_LABELS, widgetLabels, jablonskiLabels, glowMetrics = false, CpuDiagram: CpuDiag = CoordComplex, RamDiagram: RamDiag = CoordComplex, DownloadDiagram: DlDiag = JablonskiDiagram, UploadDiagram: UlDiag = JablonskiDiagram, ServerStorageDiagram: SrvStorDiag = OrbitalDiagram, MediaStorageDiagram: MediaStorDiag = OrbitalDiagram, SpeedtestDiagram: SpeedDiag = SpeedtestSparkline }) => {
  const _stored = loadStoredResults();
  const bwRefLive = useRef({ srv1: _stored?.srv1?.downloadMbps ?? 100, srv2: _stored?.srv2?.downloadMbps ?? 100 });
  const [bwRef, setBwRef] = useState({ srv1: _stored?.srv1?.downloadMbps ?? 100, srv2: _stored?.srv2?.downloadMbps ?? 100 });

  // SRV-1 Glances metrics
  const srv1Query = useQuery({
    queryKey: ['glances-srv1'],
    queryFn: async () => {
      let ramPct = 0, ramGB = '?', totalGB = '?';
      let cpuStats = { level: 45, isBoiling: false, details: [], online: true };
      let ramStats = { level: 60, isBoiling: false, details: [], online: true };
      let bandwidthStats = { level: 30, isBoiling: false, details: [], online: true };
      let bw1UpStats = { level: 0, isBoiling: false, details: [], online: true };
      let driveC = defaultStats(), driveJ = defaultStats(), driveQ = defaultStats(), driveT = defaultStats();
      let bwMbps = 0, bwIface = '';
      let storageLog = [];

      // RAM
      try {
        const memRes = await fetch('/api/glances/api/4/mem');
        if (memRes.ok) {
          const mem = await memRes.json();
          ramPct   = mem.percent ?? 0;
          ramGB    = (mem.used  / 1e9).toFixed(1);
          totalGB  = (mem.total / 1e9).toFixed(1);
          ramStats = { level: ramPct, online: true, isBoiling: ramPct > 80,
            details: [{ label: 'USED', value: `${ramGB} GB` }, { label: 'TOTAL', value: `${totalGB} GB` }] };
        }
      } catch (_) {}

      // Storage
      try {
        const [fsRes, diskioRes] = await Promise.all([
          fetch('/api/glances/api/4/fs'),
          fetch('/api/glances/api/4/diskio').catch(() => null),
        ]);

        let diskioMap = {};
        if (diskioRes?.ok) {
          const diskioData = await diskioRes.json();
          const physical = diskioData.filter(d => !d.disk_name.startsWith('loop') && !d.disk_name.startsWith('ram'));
          for (const d of physical) {
            const dt = Math.max(d.time_since_update ?? 1, 0.1);
            diskioMap[d.disk_name.toLowerCase()] = {
              readMBps:  ((d.read_bytes  ?? 0) / dt / 1e6).toFixed(1),
              writeMBps: ((d.write_bytes ?? 0) / dt / 1e6).toFixed(1),
            };
          }
        }
        const findIO = (letter) => diskioMap[`${letter}:`] || diskioMap[letter] || null;
        const ioDetails = (io) => io
          ? [{ label: 'I',  value: `${io.readMBps} MB/s` }, { label: 'O', value: `${io.writeMBps} MB/s` }]
          : [];

        if (fsRes.ok) {
          const fsData = await fsRes.json();
          const norm = (s) => (s ?? '').toLowerCase().replace(/\\/g, '/').replace(/\/$/, '');
          const find = (mnt, winDrive) => fsData.find(f => norm(f.mnt_point) === norm(mnt)) || fsData.find(f => norm(f.mnt_point) === norm(winDrive));
          const toStats = (f, letter) => f
            ? { level: f.percent, isBoiling: f.percent > 85, online: true,
                details: [
                  { label: 'USED', value: `${(f.used/1e9).toFixed(1)} GB` },
                  { label: 'FREE', value: `${(f.free/1e9).toFixed(1)} GB` },
                  ...ioDetails(findIO(letter)),
                ] }
            : defaultStats();
          const c = find('/mnt/c', 'C:'), j = find('/mnt/j', 'J:'), q = find('/mnt/q', 'Q:'), t = find('/mnt/t', 'T:');
          driveC = toStats(c, 'c'); driveJ = toStats(j, 'j'); driveQ = toStats(q, 'q'); driveT = toStats(t, 't');
          storageLog = [c && `C:${c.percent.toFixed(0)}%`, j && `J:${j.percent.toFixed(0)}%`,
                        q && `Q:${q.percent.toFixed(0)}%`, t && `T:${t.percent.toFixed(0)}%`].filter(Boolean);
        }
      } catch (_) {}

      // Bandwidth
      try {
        const netRes = await fetch('/api/glances/api/4/network');
        if (netRes.ok) {
          const nets = await netRes.json();
          const best = nets
            .filter(n => !['lo'].includes(n.interface_name) && !n.interface_name.startsWith('br-') && !n.interface_name.startsWith('docker') && !n.interface_name.startsWith('veth'))
            .sort((a, b) => ((b.rx ?? 0) + (b.tx ?? 0)) - ((a.rx ?? 0) + (a.tx ?? 0)))[0];
          if (best) {
            const dt = Math.max(best.time_since_update ?? 1, 0.1);
            const rxBps = best.rx ?? (best.bytes_recv != null ? best.bytes_recv / dt : 0);
            const txBps = best.tx ?? (best.bytes_sent != null ? best.bytes_sent / dt : 0);
            const rxMbps = (rxBps * 8) / 1e6;
            const txMbps = (txBps * 8) / 1e6;
            bwMbps  = rxMbps;
            bwIface = best.interface_name;
            bandwidthStats = { level: Math.min((rxMbps / bwRefLive.current.srv1) * 100, 100), online: true, isBoiling: rxMbps > bwRefLive.current.srv1 * 0.8,
              details: [{ label: 'IFACE', value: bwIface }, { label: 'DOWN', value: `${rxMbps.toFixed(1)} Mbps` }] };
            bw1UpStats = { level: Math.min((txMbps / bwRefLive.current.srv1) * 100, 100), online: true, isBoiling: txMbps > bwRefLive.current.srv1 * 0.8,
              details: [{ label: 'IFACE', value: bwIface }, { label: 'UP', value: `${txMbps.toFixed(1)} Mbps` }] };
          }
        }
      } catch (_) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          bwMbps = conn.downlink || 0;
          bandwidthStats = { level: Math.min((bwMbps / bwRefLive.current.srv1) * 100, 100), online: true,
            details: [{ label: 'DOWNLINK', value: `${bwMbps} Mbps` }] };
        }
      }

      // CPU
      try {
        const cpuRes = await fetch('/api/glances/api/4/cpu');
        if (cpuRes.ok) {
          const cpu = await cpuRes.json();
          const pct = cpu.total ?? 0;
          cpuStats = { level: pct, online: true, isBoiling: pct > 70,
            details: [{ label: 'LOAD', value: `${pct.toFixed(1)}%` }] };
        }
      } catch (_) { cpuStats = { ...cpuStats, online: false }; }

      return { cpuStats, ramStats, bandwidthStats, bw1UpStats, driveC, driveJ, driveQ, driveT,
               ramPct, ramGB, totalGB, bwMbps, bwIface, storageLog };
    },
    refetchInterval: 5_000,
  });

  // SRV-2 Glances metrics
  const srv2Query = useQuery({
    queryKey: ['glances-srv2'],
    queryFn: async () => {
      let cpu2Stats = { level: 0, isBoiling: false, details: [], online: false };
      let ram2Stats = { level: 0, isBoiling: false, details: [], online: false };
      let bw2Stats  = { level: 0, isBoiling: false, details: [], online: false };
      let bw2UpStats = { level: 0, isBoiling: false, details: [], online: false };
      let driveC2 = defaultStats();

      // CPU
      try {
        const cpuRes = await fetch('/api/glances2/api/4/cpu');
        if (cpuRes.ok) {
          const cpu = await cpuRes.json();
          const pct = cpu.total ?? 0;
          cpu2Stats = { level: pct, online: true, isBoiling: pct > 70,
            details: [{ label: 'LOAD', value: `${pct.toFixed(1)}%` }] };
        }
      } catch (_) { cpu2Stats = { ...cpu2Stats, online: false }; }

      // RAM
      try {
        const memRes = await fetch('/api/glances2/api/4/mem');
        if (memRes.ok) {
          const mem = await memRes.json();
          const pct = mem.percent ?? 0;
          ram2Stats = { level: pct, online: true, isBoiling: pct > 80,
            details: [{ label: 'USED', value: `${(mem.used/1e9).toFixed(1)} GB` }, { label: 'TOTAL', value: `${(mem.total/1e9).toFixed(1)} GB` }] };
        }
      } catch (_) { ram2Stats = { ...ram2Stats, online: false }; }

      // C:\ drive + diskio
      try {
        const [fsRes, diskioRes2] = await Promise.all([
          fetch('/api/glances2/api/4/fs'),
          fetch('/api/glances2/api/4/diskio').catch(() => null),
        ]);
        let diskioMap2 = {};
        if (diskioRes2?.ok) {
          const diskioData2 = await diskioRes2.json();
          for (const d of diskioData2.filter(d => !d.disk_name.startsWith('loop') && !d.disk_name.startsWith('ram'))) {
            const dt = Math.max(d.time_since_update ?? 1, 0.1);
            diskioMap2[d.disk_name.toLowerCase()] = {
              readMBps:  ((d.read_bytes  ?? 0) / dt / 1e6).toFixed(1),
              writeMBps: ((d.write_bytes ?? 0) / dt / 1e6).toFixed(1),
            };
          }
        }
        const findIO2 = (letter) => diskioMap2[`${letter}:`] || diskioMap2[letter] || null;
        if (fsRes.ok) {
          const fsData = await fsRes.json();
          const norm = (s) => (s ?? '').toLowerCase().replace(/\\/g, '/').replace(/\/$/, '');
          const f = fsData.find(d => norm(d.mnt_point) === 'c:') || fsData.find(d => norm(d.mnt_point) === '/mnt/c')
                 || fsData.find(d => d.device_name && d.device_name.startsWith('/dev/') && d.fs_type === 'ext4');
          const devName = f?.device_name?.replace('/dev/', '') || 'c';
          const io = findIO2('c') || diskioMap2[devName];
          driveC2 = f
            ? { level: f.percent, isBoiling: f.percent > 85, online: true,
                details: [
                  { label: 'USED', value: `${(f.used/1e9).toFixed(1)} GB` },
                  { label: 'FREE', value: `${(f.free/1e9).toFixed(1)} GB` },
                  ...(io ? [{ label: 'I', value: `${io.readMBps} MB/s` }, { label: 'O', value: `${io.writeMBps} MB/s` }] : []),
                ] }
            : defaultStats();
        }
      } catch (_) { driveC2 = { ...driveC2, online: false }; }

      // Bandwidth — split DOWN / UP
      try {
        const netRes = await fetch('/api/glances2/api/4/network');
        if (netRes.ok) {
          const nets = await netRes.json();
          const candidates = nets.filter(
            n => !['lo'].includes(n.interface_name) &&
                 !n.interface_name.startsWith('br-') &&
                 !n.interface_name.startsWith('docker') &&
                 !n.interface_name.startsWith('veth')
          );
          const best = candidates.find(n => n.interface_name === 'Ethernet') ??
                       candidates.sort((a, b) => ((b.rx ?? 0) + (b.tx ?? 0)) - ((a.rx ?? 0) + (a.tx ?? 0)))[0];
          if (best) {
            const dt = Math.max(best.time_since_update ?? 1, 0.1);
            const rxBps = best.rx ?? (best.bytes_recv != null ? best.bytes_recv / dt : 0);
            const txBps = best.tx ?? (best.bytes_sent != null ? best.bytes_sent / dt : 0);
            const rxMbps = (rxBps * 8) / 1e6;
            const txMbps = (txBps * 8) / 1e6;
            bw2Stats = { level: Math.min((rxMbps / bwRefLive.current.srv2) * 100, 100), online: true, isBoiling: rxMbps > bwRefLive.current.srv2 * 0.8,
              details: [{ label: 'IFACE', value: best.interface_name }, { label: 'DOWN', value: `${rxMbps.toFixed(1)} Mbps` }] };
            bw2UpStats = { level: Math.min((txMbps / bwRefLive.current.srv2) * 100, 100), online: true, isBoiling: txMbps > bwRefLive.current.srv2 * 0.8,
              details: [{ label: 'IFACE', value: best.interface_name }, { label: 'UP', value: `${txMbps.toFixed(1)} Mbps` }] };
          }
        }
      } catch (_) { bw2Stats = { ...bw2Stats, online: false }; bw2UpStats = { ...bw2UpStats, online: false }; }

      return { cpu2Stats, ram2Stats, bw2Stats, bw2UpStats, driveC2 };
    },
    refetchInterval: 5_000,
  });

  // Logging (throttled — log every 6th poll = every 30s)
  const metricsLogTick = useRef(0);
  useEffect(() => {
    if (!srv1Query.data) return;
    metricsLogTick.current++;
    if (metricsLogTick.current % 6 === 0) {
      const { ramPct, ramGB, totalGB, bwMbps, bwIface, storageLog } = srv1Query.data;
      if (ramPct > 0)            addLog('RAM',       `Used: ${ramGB} GB / ${totalGB} GB (${ramPct.toFixed(0)}%)`, ramPct > 80 ? 'warn' : 'info');
      if (bwMbps > 0)            addLog('BANDWIDTH',  `${bwIface}: ${bwMbps.toFixed(1)} Mbps`,                    bwMbps < 1  ? 'warn' : 'info');
      if (storageLog.length > 0) addLog('STORAGE',    storageLog.join(' | '),                                      'info');
    }
  }, [srv1Query.data, addLog]);

  // Daily speed test
  useEffect(() => {
    const stored = loadStoredResults();
    const needsTest = !stored || isStale(stored.srv1?.timestamp ?? 0);
    if (!needsTest) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const r1 = await runSpeedTestForServer(SRV1_PATH, controller.signal);
      const r2 = await runSpeedTestForServer(SRV2_PATH, controller.signal);
      const srv1Mbps = r1?.downloadMbps ?? (stored?.srv1?.downloadMbps ?? 100);
      const srv2Mbps = r2?.downloadMbps ?? (stored?.srv2?.downloadMbps ?? 100);
      bwRefLive.current = { srv1: srv1Mbps, srv2: srv2Mbps };
      setBwRef({ srv1: srv1Mbps, srv2: srv2Mbps });
      saveResults(srv1Mbps, srv2Mbps);
    }, 30000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  const cpuStats      = srv1Query.data?.cpuStats      ?? { level: 45, isBoiling: false, details: [], online: true };
  const ramStats      = srv1Query.data?.ramStats      ?? { level: 60, isBoiling: false, details: [], online: true };
  const bandwidthStats = srv1Query.data?.bandwidthStats ?? { level: 30, isBoiling: false, details: [], online: true };
  const bw1UpStats    = srv1Query.data?.bw1UpStats    ?? { level: 0, isBoiling: false, details: [], online: true };
  const driveC        = srv1Query.data?.driveC        ?? defaultStats();
  const driveJ        = srv1Query.data?.driveJ        ?? defaultStats();
  const driveQ        = srv1Query.data?.driveQ        ?? defaultStats();
  const driveT        = srv1Query.data?.driveT        ?? defaultStats();

  const cpu2Stats  = srv2Query.data?.cpu2Stats  ?? { level: 0, isBoiling: false, details: [], online: false };
  const ram2Stats  = srv2Query.data?.ram2Stats  ?? { level: 0, isBoiling: false, details: [], online: false };
  const bw2Stats   = srv2Query.data?.bw2Stats   ?? { level: 0, isBoiling: false, details: [], online: false };
  const bw2UpStats = srv2Query.data?.bw2UpStats ?? { level: 0, isBoiling: false, details: [], online: false };
  const driveC2    = srv2Query.data?.driveC2    ?? defaultStats();

  const cpuLowSpin  = transcodingActive;
  const ramLowSpin  = plexStatsLevel > 40;
  const cpu2LowSpin = transcodingActive;
  const ram2LowSpin = ram2Stats.level > 60;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
      <div className="flex gap-0 items-start">

        {/* Column 1 — SRV-1 */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            {sectionLabels.srv1}
          </div>
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <div className={glowMetrics ? 'schlenk-metric-glow' : undefined}><CpuDiag size={110} label={glancesLabels.cpu}  level={cpuStats.level} online={cpuStats.online} details={cpuStats.details} metal="Fe" lowSpin={cpuLowSpin} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow' : undefined}><RamDiag size={110} label={glancesLabels.ram} level={ramStats.level} online={ramStats.online} details={ramStats.details} metal="Co" lowSpin={ramLowSpin} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow-warm' : undefined}><DlDiag size={110} label={glancesLabels.netDown} level={bandwidthStats.level} online={bandwidthStats.online} details={bandwidthStats.details} variant="emission"   jablonskiLabel={jablonskiLabels?.emission} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow-warm' : undefined}><UlDiag size={110} label={glancesLabels.netUp}   level={bw1UpStats.level}     online={bw1UpStats.online}     details={bw1UpStats.details}     variant="excitation" jablonskiLabel={jablonskiLabels?.excitation} /></div>
          </div>
        </div>

        {/* Vertical divider — serves as Col1|Col3 divider on mobile when storage is hidden */}
        <div className="w-px flex-shrink-0 self-stretch bg-white/12 my-2" />

        {/* Column 2 — Storage (hidden on mobile <768px, diagrams too complex) */}
        <div className="hidden md:block flex-1 min-w-0 min-w-[280px] px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            {sectionLabels.storage}
          </div>
          <div className="flex flex-col items-center gap-6">
            {/* Row 1 — Server drives (SRV-1 + SRV-2 always paired) */}
            <div className="flex justify-center gap-6">
              <SrvStorDiag size={110} label={storageLabels.srv1} level={driveC.level}  online={driveC.online}  details={driveC.details}  catKey="PNICTOGEN" />
              <SrvStorDiag size={110} label={storageLabels.srv2} level={driveC2.level} online={driveC2.online} details={driveC2.details} catKey="HALOGEN"   />
            </div>
            {/* Row 2 — Media drives (TV + Movies + Music_Photos always grouped) */}
            <div className="flex justify-center gap-6 flex-wrap">
              <MediaStorDiag size={110} label={storageLabels.tv}         level={driveJ.level} online={driveJ.online} details={driveJ.details} catKey="CHALCOGEN"  />
              <MediaStorDiag size={110} label={storageLabels.movies}     level={driveQ.level} online={driveQ.online} details={driveQ.details} catKey="LANTHANIDE" />
              <MediaStorDiag size={110} label={storageLabels.musicPhotos} level={driveT.level} online={driveT.online} details={driveT.details} catKey="ACTINIDE"   />
            </div>
          </div>
          {/* NH-08: Speedtest sparkline */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <SpeedDiag />
          </div>
          {/* NH-68: Disk trend sparklines */}
          <DiskTrendSparkline />
        </div>

        {/* Vertical divider (hidden with storage column on mobile) */}
        <div className="hidden md:block w-px flex-shrink-0 self-stretch bg-white/12 my-2" />

        {/* Column 3 — SRV-2 */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            {sectionLabels.srv2}
          </div>
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <div className={glowMetrics ? 'schlenk-metric-glow' : undefined}><CpuDiag size={110} label={glancesLabels.cpu}  level={cpu2Stats.level} online={cpu2Stats.online} details={cpu2Stats.details} metal="Cu" isJahnTeller lowSpin={cpu2LowSpin} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow' : undefined}><RamDiag size={110} label={glancesLabels.ram} level={ram2Stats.level} online={ram2Stats.online} details={ram2Stats.details} metal="Ni" lowSpin={ram2LowSpin} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow-warm' : undefined}><DlDiag size={110} label={glancesLabels.netDown} level={bw2Stats.level}   online={bw2Stats.online}   details={bw2Stats.details}   variant="emission"   jablonskiLabel={jablonskiLabels?.emission} /></div>
            <div className={glowMetrics ? 'schlenk-metric-glow-warm' : undefined}><UlDiag size={110} label={glancesLabels.netUp}   level={bw2UpStats.level} online={bw2UpStats.online} details={bw2UpStats.details} variant="excitation" jablonskiLabel={jablonskiLabels?.excitation} /></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemMetricsPanel;
