import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/apiClient.js';

const MONO = 'monospace';

// Non-Docker system ports that are always expected.
// Docker-managed ports are discovered dynamically from port-audit.json `docker_ports`.
const SYSTEM_PORTS = new Set([
  '10.255.255.254:53',  // WSL2 DNS resolver
  '127.0.0.53%lo:53',   // systemd-resolved
  '127.0.0.54:53',      // systemd-resolved
  '0.0.0.0:2222',       // triggercmd (host-network-like)
  '0.0.0.0:5804',       // lan-presence (network_mode: host)
  '0.0.0.0:8888',       // tautulli-bridge (network_mode: host)
  '0.0.0.0:3101',       // homeplanner vite dev server (non-Docker)
  '0.0.0.0:8123',       // home assistant (native install, not Docker)
  '0.0.0.0:47110',      // superpowers:brainstorming visual companion (transient)
]);

/** Build the full expected set from dynamic docker_ports + static system ports */
function buildExpectedSet(dockerPorts) {
  const expected = new Set(SYSTEM_PORTS);
  for (const p of dockerPorts) expected.add(p);
  // IPv6 [::]:PORT equivalents of any 0.0.0.0:PORT entry
  const v4Ports = new Set();
  for (const p of expected) {
    if (p.startsWith('0.0.0.0:')) v4Ports.add(p.split(':')[1]);
  }
  return { expected, v4Ports };
}

function isExpectedPort(addr, expected, v4Ports) {
  if (expected.has(addr)) return true;
  const v6Match = addr.match(/^\[::]:(\d+)$/);
  if (v6Match && v4Ports.has(v6Match[1])) return true;
  return false;
}

// SYN-P1-12: icon added alongside dot — WCAG 1.4.1 (color not sole conveyor of status)
const STATUS_ICON = (color) => {
  if (color === '#4ade80') return '\u2713';
  if (color === '#f87171') return '\u2717';
  if (color === '#fde047') return '!';
  return '\u25C6';
};

const StatusBadge = ({ label, color, bgColor, borderC, items }) => {
  const [hovered, setHovered] = useState(false);
  const hasItems = items && items.length > 0;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', border: `1px solid ${borderC}`, borderRadius: 4,
        background: bgColor, fontFamily: MONO, fontSize: 8,
        letterSpacing: '0.1em', color, cursor: hasItems ? 'default' : undefined }}>
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: color,
          display: 'inline-block', flexShrink: 0 }} />
        <span aria-hidden="true" style={{ fontSize: 9, lineHeight: 1 }}>{STATUS_ICON(color)}</span>
        {label}
      </div>

      {hasItems && hovered && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          zIndex: 200, minWidth: 220, maxWidth: 360, maxHeight: 320,
          overflowY: 'auto',
          background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
          padding: '8px 0', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
          className="scrollbar-none"
        >
          {items.map((item, i) => (
            <div key={i} style={{
              padding: '4px 12px', fontFamily: MONO, fontSize: 9,
              letterSpacing: '0.05em', lineHeight: 1.5,
              color: item.color || 'rgba(255,255,255,0.55)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {item.dot && (
                <span style={{
                  width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                  background: item.dot,
                }} />
              )}
              <span style={{
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PortAuditBadge = ({ data, isLoading, isError }) => {
  const { ports = [], docker_ports = [], error = null } = data || {};
  const err = isError || error;
  const { expected, v4Ports } = buildExpectedSet(docker_ports);
  const knownPorts = [];
  const unexpected = [];
  for (const p of (ports || [])) {
    const addr = p.split(' ')[0];
    if (isExpectedPort(addr, expected, v4Ports)) {
      knownPorts.push(addr);
    } else {
      unexpected.push(addr);
    }
  }
  const hasAlert = unexpected.length > 0;
  const color    = err ? 'rgba(156,163,175,0.8)' : hasAlert ? '#f87171' : '#4ade80';
  const bgColor  = err ? 'rgba(255,255,255,0.03)' : hasAlert ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.06)';
  const borderC  = err ? 'rgba(255,255,255,0.08)' : hasAlert ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.2)';
  const label    = isLoading
    ? 'PORTS: ...'
    : err
    ? 'PORTS: ERR'
    : `PORTS: ${ports.length} (${hasAlert ? `${unexpected.length} UNKNOWN` : 'OK'})`;

  const items = [];
  if (unexpected.length > 0) {
    items.push({ label: `\u2501 ${unexpected.length} UNKNOWN`, color: 'rgba(248,113,113,0.7)' });
    for (const u of unexpected) items.push({ label: u, dot: '#f87171', color: 'rgba(248,113,113,0.6)' });
    items.push({ label: '', color: 'transparent' });
  }
  items.push({ label: `\u2501 ${knownPorts.length} EXPECTED`, color: 'rgba(74,222,128,0.5)' });
  const sorted = [...knownPorts].sort((a, b) => {
    const pa = parseInt(a.split(':').pop()) || 0;
    const pb = parseInt(b.split(':').pop()) || 0;
    return pa - pb;
  });
  for (const p of sorted) items.push({ label: p, dot: '#4ade80', color: 'rgba(255,255,255,0.4)' });

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err ? null : items} />;
};

const LanFirewallBadge = ({ data, isLoading, isError }) => {
  const { win_firewall = null, portproxy_count = 0, portproxy_rules = [], firewall_profiles = [], error = null } = data || {};
  const err = isError || error;
  const isActive  = win_firewall === 'all_active';
  const isPartial = win_firewall === 'partial';
  const color     = err ? 'rgba(156,163,175,0.8)' : isActive ? '#4ade80' : isPartial ? '#fde047' : '#f87171';
  const bgColor   = err ? 'rgba(255,255,255,0.03)' : isActive ? 'rgba(74,222,128,0.06)' : isPartial ? 'rgba(253,224,71,0.06)' : 'rgba(239,68,68,0.08)';
  const borderC   = err ? 'rgba(255,255,255,0.08)' : isActive ? 'rgba(74,222,128,0.2)' : isPartial ? 'rgba(253,224,71,0.25)' : 'rgba(239,68,68,0.3)';
  const label     = isLoading ? 'LAN: ...' : err ? 'LAN: ERR'
    : isActive ? `LAN: WIN_FW \u2713 ${portproxy_count} RULES`
    : isPartial ? 'LAN: WIN_FW PARTIAL'
    : 'LAN: WIN_FW OFF';

  const items = [];
  if (firewall_profiles && firewall_profiles.length > 0) {
    items.push({ label: '\u2501 FIREWALL PROFILES', color: 'rgba(255,255,255,0.5)' });
    for (const p of firewall_profiles) {
      const active = p.enabled || p.active;
      items.push({ label: `${p.name || p.profile}: ${active ? 'ACTIVE' : 'OFF'}`, dot: active ? '#4ade80' : '#f87171', color: active ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.6)' });
    }
  } else {
    items.push({ label: `FIREWALL: ${isActive ? 'ALL ACTIVE' : isPartial ? 'PARTIAL' : 'OFF'}`, dot: color, color: 'rgba(255,255,255,0.5)' });
  }
  if (portproxy_count > 0) {
    items.push({ label: '', color: 'transparent' });
    items.push({ label: `\u2501 ${portproxy_count} PORTPROXY RULES`, color: 'rgba(255,255,255,0.5)' });
    if (portproxy_rules && portproxy_rules.length > 0) {
      for (const r of portproxy_rules) items.push({ label: r, color: 'rgba(255,255,255,0.35)' });
    }
  }

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err ? null : items} />;
};

const WanBadge = ({ data, isLoading, isError }) => {
  const { wan_exposure = null, error = null, tunnel_services = [] } = data || {};
  const err = isError || error;
  const isTunnelOnly = wan_exposure === 'tunnel_only';
  const color   = err ? 'rgba(156,163,175,0.8)' : isTunnelOnly ? '#4ade80' : '#fde047';
  const bgColor = err ? 'rgba(255,255,255,0.03)' : isTunnelOnly ? 'rgba(74,222,128,0.06)' : 'rgba(253,224,71,0.06)';
  const borderC = err ? 'rgba(255,255,255,0.08)' : isTunnelOnly ? 'rgba(74,222,128,0.2)' : 'rgba(253,224,71,0.25)';
  const label   = isLoading ? 'WAN: ...' : err ? 'WAN: ERR'
    : isTunnelOnly ? 'WAN: TUNNEL ONLY' : `WAN: ${wan_exposure?.toUpperCase() ?? 'UNKNOWN'}`;

  const items = [{ label: `EXPOSURE: ${wan_exposure?.toUpperCase() || 'UNKNOWN'}`, dot: color, color: 'rgba(255,255,255,0.5)' }];
  if (tunnel_services && tunnel_services.length > 0) {
    items.push({ label: '', color: 'transparent' });
    items.push({ label: '\u2501 TUNNEL SERVICES', color: 'rgba(255,255,255,0.5)' });
    for (const s of tunnel_services) items.push({ label: s, dot: '#4ade80', color: 'rgba(255,255,255,0.4)' });
  }

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err ? null : items} />;
};

const Srv2Badge = ({ data, isLoading, isError }) => {
  const { srv2_up = 0, srv2_down = 0, srv2_services = [], error = null } = data || {};
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

  const items = [];
  if (srv2_services && srv2_services.length > 0) {
    const up = srv2_services.filter(s => s.open);
    const down = srv2_services.filter(s => !s.open);
    if (down.length > 0) {
      items.push({ label: `\u2501 ${down.length} DOWN`, color: 'rgba(248,113,113,0.7)' });
      for (const s of down) items.push({ label: `${s.name} :${s.port}`, dot: '#f87171', color: 'rgba(248,113,113,0.6)' });
      items.push({ label: '', color: 'transparent' });
    }
    items.push({ label: `\u2501 ${up.length} UP`, color: 'rgba(74,222,128,0.5)' });
    for (const s of up) items.push({ label: `${s.name} :${s.port}`, dot: '#4ade80', color: 'rgba(255,255,255,0.4)' });
  }

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err ? null : items} />;
};

const KeyAuditBadge = ({ data, isLoading, isError }) => {
  const { stale = 0, expired = 0, error = null, total = null, keys = [] } = data || {};
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

  const items = [];
  if (keys && keys.length > 0) {
    const expiredKeys = keys.filter(k => k.expired);
    const staleKeys = keys.filter(k => k.stale && !k.expired);
    const okKeys = keys.filter(k => !k.stale && !k.expired);
    if (expiredKeys.length > 0) {
      items.push({ label: `\u2501 ${expiredKeys.length} EXPIRED`, color: 'rgba(248,113,113,0.7)' });
      for (const k of expiredKeys) items.push({ label: k.name || k.key, dot: '#f87171', color: 'rgba(248,113,113,0.6)' });
      items.push({ label: '', color: 'transparent' });
    }
    if (staleKeys.length > 0) {
      items.push({ label: `\u2501 ${staleKeys.length} STALE`, color: 'rgba(253,224,71,0.7)' });
      for (const k of staleKeys) items.push({ label: k.name || k.key, dot: '#fde047', color: 'rgba(253,224,71,0.6)' });
      items.push({ label: '', color: 'transparent' });
    }
    items.push({ label: `\u2501 ${okKeys.length} OK`, color: 'rgba(74,222,128,0.5)' });
    for (const k of okKeys) items.push({ label: k.name || k.key, dot: '#4ade80', color: 'rgba(255,255,255,0.4)' });
  } else if (total !== null) {
    items.push({ label: `${total} KEYS TRACKED`, color: 'rgba(255,255,255,0.4)' });
    if (expired > 0) items.push({ label: `${expired} EXPIRED`, dot: '#f87171', color: 'rgba(248,113,113,0.6)' });
    if (stale > 0) items.push({ label: `${stale} STALE`, dot: '#fde047', color: 'rgba(253,224,71,0.6)' });
    if (total - expired - stale > 0) items.push({ label: `${total - expired - stale} OK`, dot: '#4ade80', color: 'rgba(74,222,128,0.6)' });
  }

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err ? null : items} />;
};

// NH-64: Image Freshness Badge
const ImageFreshnessBadge = ({ data, isLoading, isError }) => {
  const images = Array.isArray(data) ? data : [];
  const err = isError;
  const staleImages = images.filter(i => i.stale);
  const currentImages = images.filter(i => !i.stale);
  const hasStale = staleImages.length > 0;
  const color   = err ? 'rgba(156,163,175,0.8)' : hasStale ? '#fbbf24' : '#4ade80';
  const bgColor = err ? 'rgba(255,255,255,0.03)' : hasStale ? 'rgba(251,191,36,0.06)' : 'rgba(74,222,128,0.06)';
  const borderC = err ? 'rgba(255,255,255,0.08)' : hasStale ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.2)';
  const label   = isLoading ? 'IMAGES: ...' : err ? 'IMAGES: ERR'
    : images.length === 0 ? 'IMAGES: ...'
    : hasStale ? `IMAGES: ${staleImages.length} UPDATES`
    : 'IMAGES: CURRENT';

  const items = [];
  if (staleImages.length > 0) {
    items.push({ label: `\u2501 ${staleImages.length} UPDATES AVAILABLE`, color: 'rgba(251,191,36,0.7)' });
    for (const img of staleImages) {
      const name = img.image?.split('/').pop()?.split(':')[0] || img.name || 'unknown';
      items.push({ label: `${name}: ${img.current || '?'} \u2192 ${img.latest || '?'}`, dot: '#fbbf24', color: 'rgba(251,191,36,0.6)' });
    }
    items.push({ label: '', color: 'transparent' });
  }
  items.push({ label: `\u2501 ${currentImages.length} CURRENT`, color: 'rgba(74,222,128,0.5)' });
  for (const img of currentImages) {
    const name = img.image?.split('/').pop()?.split(':')[0] || img.name || 'unknown';
    items.push({ label: `${name}: ${img.current || '?'}`, dot: '#4ade80', color: 'rgba(255,255,255,0.35)' });
  }

  return <StatusBadge label={label} color={color} bgColor={bgColor} borderC={borderC} items={isLoading || err || images.length === 0 ? null : items} />;
};

export const SecurityBadgeRow = ({ addLog, vertical = false }) => {
  const portQuery = useQuery({
    queryKey: ['port-audit'],
    queryFn: () => apiFetch('/api/port-audit'),
    refetchInterval: 120_000,
    onSuccess: (data) => {
      const ports = Array.isArray(data?.ports) ? data.ports : [];
      const dockerPorts = Array.isArray(data?.docker_ports) ? data.docker_ports : [];
      const { expected, v4Ports } = buildExpectedSet(dockerPorts);
      const unexpected = ports.filter(p => !isExpectedPort(p.split(' ')[0], expected, v4Ports));
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
    <div style={{
      display: 'flex',
      gap: vertical ? 8 : 10,
      flexWrap: vertical ? 'nowrap' : 'wrap',
      alignItems: vertical ? 'flex-start' : 'center',
      flexDirection: vertical ? 'column' : 'row',
    }}>
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
