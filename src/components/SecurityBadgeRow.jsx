import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/apiClient.js';

const MONO = 'monospace';

const EXPECTED_PORTS = new Set([
  '0.0.0.0:22', '0.0.0.0:80', '0.0.0.0:443',
  '127.0.0.1:3000', '127.0.0.1:5000', '127.0.0.1:5055',
  '127.0.0.1:6767', '127.0.0.1:7878', '127.0.0.1:8080',
  '127.0.0.1:8085', '127.0.0.1:8181', '127.0.0.1:8686',
  '127.0.0.1:8840', '127.0.0.1:8888', '127.0.0.1:8989',
  '127.0.0.1:9696', '127.0.0.1:3001',
]);

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
    return !EXPECTED_PORTS.has(addr);
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

const UfwStatusBadge = ({ data, isLoading, isError }) => {
  const { status = null, error = null } = data || {};
  const err = isError || error;
  const isActive  = status === 'active';
  const color     = err ? 'rgba(156,163,175,0.8)' : isActive ? '#4ade80' : '#f87171';
  const bgColor   = err ? 'rgba(255,255,255,0.03)' : isActive ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.08)';
  const borderC   = err ? 'rgba(255,255,255,0.08)' : isActive ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.3)';
  const label     = isLoading ? 'UFW: ...' : err ? 'UFW: ERR' : isActive ? 'UFW: ACTIVE' : 'UFW: INACTIVE';
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

const BazarrHealthCard = ({ data, isLoading, isError }) => {
  const [tab, setTab] = React.useState('coverage');
  const { movies, episodes, providers = [] } = data || {};

  const coverage = (obj) => {
    if (!obj || obj.total === 0) return null;
    return Math.round((obj.with_subs / obj.total) * 100);
  };
  const movPct = coverage(movies);
  const epPct  = coverage(episodes);
  const dotColor = () => {
    if (isError || !data) return '#6b7280';
    if (movPct === null && epPct === null) return '#6b7280';
    const min = Math.min(movPct ?? 100, epPct ?? 100);
    if (min >= 98) return '#4ade80';
    if (min >= 90) return '#fde047';
    return '#f87171';
  };

  const errProviders = providers.filter(p => p.last_error);
  const sortedProviders = [...errProviders, ...providers.filter(p => !p.last_error)];

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '12px 14px', minWidth: 220, maxWidth: 320 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(), flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ BAZARR_HEALTH
        </span>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {['coverage', 'providers'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
              padding: '2px 6px', borderRadius: 3, border: '1px solid',
              borderColor: tab === t ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
              background: tab === t ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: tab === t ? '#38bdf8' : 'rgba(255,255,255,0.3)',
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {isLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
      {isError && <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>BAZARR_OFFLINE</div>}

      {!isLoading && !isError && tab === 'coverage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['MOVIES', movies, movPct], ['EPISODES', episodes, epPct]].map(([label, obj, pct]) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>{label}</span>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>
                  {obj ? `${(obj.with_subs || 0).toLocaleString()} / ${(obj.total || 0).toLocaleString()}` : '—'}{pct !== null ? ` (${pct}%)` : ''}
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 3 }}>
                <div style={{ width: `${pct ?? 0}%`, height: '100%', borderRadius: 2,
                  background: pct >= 98 ? 'rgba(74,222,128,0.6)' : pct >= 90 ? 'rgba(253,224,71,0.6)' : 'rgba(248,113,113,0.6)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && tab === 'providers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
          {sortedProviders.length === 0 && (
            <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO_PROVIDERS</span>
          )}
          {sortedProviders.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                background: p.last_error ? '#f87171' : p.enabled ? '#4ade80' : '#6b7280' }} />
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              {p.last_error && (
                <span style={{ fontFamily: MONO, fontSize: 7, color: '#f87171',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{p.last_error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SecurityBadgeRow = ({ addLog }) => {
  const portQuery = useQuery({
    queryKey: ['port-audit'],
    queryFn: () => apiFetch('/api/port-audit'),
    refetchInterval: 120_000,
    onSuccess: (data) => {
      const ports = Array.isArray(data?.ports) ? data.ports : [];
      const unexpected = ports.filter(p => !EXPECTED_PORTS.has(p.split(' ')[0]));
      if (addLog) addLog('PORT-AUDIT', `${ports.length} ports (${unexpected.length} unknown)`, unexpected.length > 0 ? 'warn' : 'info');
    },
    onError: (err) => { if (addLog) addLog('PORT-AUDIT', `Failed: ${err.message}`, 'warn'); },
  });

  const ufwQuery = useQuery({
    queryKey: ['ufw-status'],
    queryFn: () => apiFetch('/api/ufw-status'),
    refetchInterval: 300_000,
    onError: (err) => { if (addLog) addLog('UFW', `Failed: ${err.message}`, 'warn'); },
  });

  const keyQuery = useQuery({
    queryKey: ['key-audit'],
    queryFn: () => apiFetch('/api/key-audit'),
    refetchInterval: 3_600_000,
    onError: (err) => { if (addLog) addLog('KEY-AUDIT', `Failed: ${err.message}`, 'warn'); },
  });

  const bazarrQuery = useQuery({
    queryKey: ['bazarr-health'],
    queryFn: () => apiFetch('/api/bazarr/health'),
    refetchInterval: 300_000,
    onError: (err) => { if (addLog) addLog('BAZARR', `Health fetch failed: ${err.message}`, 'warn'); },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <PortAuditBadge data={portQuery.data} isLoading={portQuery.isLoading} isError={portQuery.isError} />
        <UfwStatusBadge data={ufwQuery.data} isLoading={ufwQuery.isLoading} isError={ufwQuery.isError} />
        <KeyAuditBadge  data={keyQuery.data}  isLoading={keyQuery.isLoading}  isError={keyQuery.isError}  />
      </div>
      <BazarrHealthCard data={bazarrQuery.data} isLoading={bazarrQuery.isLoading} isError={bazarrQuery.isError} />
    </div>
  );
};

export default SecurityBadgeRow;
