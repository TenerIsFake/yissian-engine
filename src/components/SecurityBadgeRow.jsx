import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/apiClient.js';

const MONO = 'monospace';

// Every listening address from docker-compose.yml + system services.
// IPv6 [::] equivalents are matched by stripping to port-only fallback.
const EXPECTED_PORTS = new Set([
  // Docker services — LAN-bound (0.0.0.0)
  '0.0.0.0:2222',   // triggercmd
  '0.0.0.0:3000',   // homepage (nginx → 8080)
  '0.0.0.0:3006',   // braintree-nginx
  '0.0.0.0:3101',   // homeplanner vite dev server
  '0.0.0.0:4030',   // docker-monitor
  '0.0.0.0:5050',   // notifiarr (alt config)
  '0.0.0.0:5454',   // notifiarr
  '0.0.0.0:5804',   // lan-presence
  '0.0.0.0:6767',   // bazarr
  '0.0.0.0:7878',   // radarr
  '0.0.0.0:8080',   // qbittorrent (via gluetun)
  '0.0.0.0:8085',   // sabnzbd
  '0.0.0.0:8384',   // syncthing UI
  '0.0.0.0:8686',   // lidarr
  '0.0.0.0:8888',   // tautulli-bridge
  '0.0.0.0:8989',   // sonarr
  '0.0.0.0:9696',   // prowlarr
  '0.0.0.0:22000',  // syncthing sync
  // Docker services — loopback only (127.0.0.1)
  '127.0.0.1:3005',  // braintree-web
  '127.0.0.1:5001',  // musicbrainz-applet
  '127.0.0.1:5800',  // hue-bridge
  '127.0.0.1:5802',  // restic-sidecar
  '127.0.0.1:5803',  // claude-terminal-sidecar
  '127.0.0.1:5984',  // couchdb
  '127.0.0.1:7681',  // claude-terminal-ttyd
  '127.0.0.1:7682',  // claude-terminal-ttyd-admin
  '127.0.0.1:7683',  // claude-terminal-clsh
  '127.0.0.1:8282',  // glances
  '127.0.0.1:8283',  // audiobookshelf (alt)
  '127.0.0.1:13378', // kavita
  // System — DNS resolvers (WSL2)
  '10.255.255.254:53',
  '127.0.0.53%lo:53',
  '127.0.0.54:53',
]);

// Also match IPv6 [::]:PORT equivalents of any 0.0.0.0:PORT entry
const EXPECTED_V4_PORTS = new Set(
  [...EXPECTED_PORTS].filter(p => p.startsWith('0.0.0.0:')).map(p => p.split(':')[1])
);

// SYN-P1-12: icon added alongside dot — WCAG 1.4.1 (color not sole conveyor of status)
const STATUS_ICON = (color) => {
  if (color === '#4ade80') return '✓';
  if (color === '#f87171') return '✗';
  if (color === '#fde047') return '!';
  return '◆';
};

const StatusBadge = ({ label, color, bgColor, borderC }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', border: `1px solid ${borderC}`, borderRadius: 4,
    background: bgColor, fontFamily: MONO, fontSize: 8,
    letterSpacing: '0.1em', color }}>
    <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: color,
      display: 'inline-block', flexShrink: 0 }} />
    <span aria-hidden="true" style={{ fontSize: 9, lineHeight: 1 }}>{STATUS_ICON(color)}</span>
    {label}
  </div>
);

const PortAuditBadge = ({ data, isLoading, isError }) => {
  const { ports = [], error = null } = data || {};
  const err = isError || error;
  const unexpected = (ports || []).filter(p => {
    const addr = p.split(' ')[0];
    if (EXPECTED_PORTS.has(addr)) return false;
    // Match [::]:PORT against known 0.0.0.0:PORT entries
    const v6Match = addr.match(/^\[::]:(\d+)$/);
    if (v6Match && EXPECTED_V4_PORTS.has(v6Match[1])) return false;
    return true;
  });
  const hasAlert = unexpected.length > 0;
  const color    = err ? 'rgba(156,163,175,0.8)' : hasAlert ? '#f87171' : '#4ade80';
  const bgColor  = err ? 'rgba(255,255,255,0.03)' : hasAlert ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.06)';
  const borderC  = err ? 'rgba(255,255,255,0.08)' : hasAlert ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.2)';
  const label    = isLoading
    ? 'PORTS: ...'
    : err
    ? 'PORTS: ERR'
    : `PORTS: ${ports.length} (${hasAlert ? `${unexpected.length} UNKNOWN` : 'OK'})`;
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

const LanFirewallBadge = ({ data, isLoading, isError }) => {
  const { win_firewall = null, portproxy_count = 0, error = null } = data || {};
  const err = isError || error;
  const isActive  = win_firewall === 'all_active';
  const isPartial = win_firewall === 'partial';
  const color     = err ? 'rgba(156,163,175,0.8)' : isActive ? '#4ade80' : isPartial ? '#fde047' : '#f87171';
  const bgColor   = err ? 'rgba(255,255,255,0.03)' : isActive ? 'rgba(74,222,128,0.06)' : isPartial ? 'rgba(253,224,71,0.06)' : 'rgba(239,68,68,0.08)';
  const borderC   = err ? 'rgba(255,255,255,0.08)' : isActive ? 'rgba(74,222,128,0.2)' : isPartial ? 'rgba(253,224,71,0.25)' : 'rgba(239,68,68,0.3)';
  const label     = isLoading ? 'LAN: ...' : err ? 'LAN: ERR'
    : isActive ? `LAN: WIN_FW ✓ ${portproxy_count} RULES`
    : isPartial ? 'LAN: WIN_FW PARTIAL'
    : 'LAN: WIN_FW OFF';
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

const WanBadge = ({ data, isLoading, isError }) => {
  const { wan_exposure = null, error = null } = data || {};
  const err = isError || error;
  const isTunnelOnly = wan_exposure === 'tunnel_only';
  const color   = err ? 'rgba(156,163,175,0.8)' : isTunnelOnly ? '#4ade80' : '#fde047';
  const bgColor = err ? 'rgba(255,255,255,0.03)' : isTunnelOnly ? 'rgba(74,222,128,0.06)' : 'rgba(253,224,71,0.06)';
  const borderC = err ? 'rgba(255,255,255,0.08)' : isTunnelOnly ? 'rgba(74,222,128,0.2)' : 'rgba(253,224,71,0.25)';
  const label   = isLoading ? 'WAN: ...' : err ? 'WAN: ERR'
    : isTunnelOnly ? 'WAN: TUNNEL ONLY' : `WAN: ${wan_exposure?.toUpperCase() ?? 'UNKNOWN'}`;
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

const Srv2Badge = ({ data, isLoading, isError }) => {
  const { srv2_up = 0, srv2_down = 0, error = null } = data || {};
  const err = isError || error;
  const total = srv2_up + srv2_down;
  const allUp = srv2_down === 0 && total > 0;
  const color   = err ? 'rgba(156,163,175,0.8)' : allUp ? '#4ade80' : srv2_down > 0 ? '#f87171' : 'rgba(156,163,175,0.8)';
  const bgColor = err ? 'rgba(255,255,255,0.03)' : allUp ? 'rgba(74,222,128,0.06)' : srv2_down > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)';
  const borderC = err ? 'rgba(255,255,255,0.08)' : allUp ? 'rgba(74,222,128,0.2)' : srv2_down > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)';
  const label   = isLoading ? 'SRV-2: ...' : err ? 'SRV-2: ERR'
    : total === 0 ? 'SRV-2: NO DATA'
    : allUp ? `SRV-2: ${srv2_up}/${total} UP`
    : `SRV-2: ${srv2_down}/${total} DOWN`;
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

const KeyAuditBadge = ({ data, isLoading, isError }) => {
  const { stale = 0, expired = 0, error = null, total = null } = data || {};
  const err = isError || error;
  const isExpired = expired > 0;
  const isStale   = !isExpired && stale > 0;
  const color     = err ? 'rgba(156,163,175,0.8)' : isExpired ? '#f87171' : isStale ? '#fde047' : '#4ade80';
  const bgColor   = err ? 'rgba(255,255,255,0.03)' : isExpired ? 'rgba(239,68,68,0.08)' : isStale ? 'rgba(253,224,71,0.06)' : 'rgba(74,222,128,0.06)';
  const borderC   = err ? 'rgba(255,255,255,0.08)' : isExpired ? 'rgba(239,68,68,0.3)' : isStale ? 'rgba(253,224,71,0.25)' : 'rgba(74,222,128,0.2)';
  const label     = isLoading
    ? 'KEYS: ...'
    : err
    ? 'KEYS: ERR'
    : total === null
    ? 'KEYS: ...'
    : isExpired
    ? `KEYS: ${expired} EXPIRED`
    : isStale
    ? `KEYS: ${stale} STALE`
    : 'KEYS OK';
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

// NH-64: Image Freshness Badge
const ImageFreshnessBadge = ({ data, isLoading, isError }) => {
  const images = Array.isArray(data) ? data : [];
  const err = isError;
  const staleCount = images.filter(i => i.stale).length;
  const hasStale = staleCount > 0;
  const color   = err ? 'rgba(156,163,175,0.8)' : hasStale ? '#fbbf24' : '#4ade80';
  const bgColor = err ? 'rgba(255,255,255,0.03)' : hasStale ? 'rgba(251,191,36,0.06)' : 'rgba(74,222,128,0.06)';
  const borderC = err ? 'rgba(255,255,255,0.08)' : hasStale ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.2)';
  const label   = isLoading ? 'IMAGES: ...' : err ? 'IMAGES: ERR'
    : images.length === 0 ? 'IMAGES: ...'
    : hasStale ? `IMAGES: ${staleCount} UPDATES`
    : 'IMAGES: CURRENT';
  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} />;
};

export const SecurityBadgeRow = ({ addLog }) => {
  const portQuery = useQuery({
    queryKey: ['port-audit'],
    queryFn: () => apiFetch('/api/port-audit'),
    refetchInterval: 120_000,
    onSuccess: (data) => {
      const ports = Array.isArray(data?.ports) ? data.ports : [];
      const unexpected = ports.filter(p => {
        const addr = p.split(' ')[0];
        if (EXPECTED_PORTS.has(addr)) return false;
        const v6Match = addr.match(/^\[::]:(\d+)$/);
        if (v6Match && EXPECTED_V4_PORTS.has(v6Match[1])) return false;
        return true;
      });
      if (addLog) addLog('PORT-AUDIT', `${ports.length} ports (${unexpected.length} unknown)`, unexpected.length > 0 ? 'warn' : 'info');
    },
    onError: (err) => { if (addLog) addLog('PORT-AUDIT', `Failed: ${err.message}`, 'warn'); },
  });

  const firewallQuery = useQuery({
    queryKey: ['firewall-status'],
    queryFn: () => apiFetch('/api/firewall-status'),
    refetchInterval: 300_000,
    onError: (err) => { if (addLog) addLog('FIREWALL', `Failed: ${err.message}`, 'warn'); },
  });

  const keyQuery = useQuery({
    queryKey: ['key-audit'],
    queryFn: () => apiFetch('/api/key-audit'),
    refetchInterval: 3_600_000,
    onError: (err) => { if (addLog) addLog('KEY-AUDIT', `Failed: ${err.message}`, 'warn'); },
  });

  const freshnessQuery = useQuery({
    queryKey: ['image-freshness'],
    queryFn: () => apiFetch('/api/flask/image-freshness'),
    refetchInterval: 3_600_000,
  });

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <WanBadge data={firewallQuery.data} isLoading={firewallQuery.isLoading} isError={firewallQuery.isError} />
      <LanFirewallBadge data={firewallQuery.data} isLoading={firewallQuery.isLoading} isError={firewallQuery.isError} />
      <Srv2Badge data={firewallQuery.data} isLoading={firewallQuery.isLoading} isError={firewallQuery.isError} />
      <PortAuditBadge data={portQuery.data} isLoading={portQuery.isLoading} isError={portQuery.isError} />
      <KeyAuditBadge  data={keyQuery.data}  isLoading={keyQuery.isLoading}  isError={keyQuery.isError}  />
      <ImageFreshnessBadge data={freshnessQuery.data} isLoading={freshnessQuery.isLoading} isError={freshnessQuery.isError} />
    </div>
  );
};

export default SecurityBadgeRow;
