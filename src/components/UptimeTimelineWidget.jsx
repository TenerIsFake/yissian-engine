import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const MONO = 'monospace';

// Status colors matching Uptime Kuma conventions
const STATUS_COLOR = {
  1: '#2ecc71',       // up
  0: '#e74c3c',       // down
  2: '#f39c12',       // pending
  3: '#95a5a6',       // maintenance
  undefined: '#2c3e50', // missing / no data
};

const BEAT_LABEL = (s) => s === 1 ? 'Up' : s === 0 ? 'Down' : s === 2 ? 'Pending' : s === 3 ? 'Maintenance' : 'Unknown';

const HeartbeatDots = ({ timeline, monitorName }) => (
  <div role="list" aria-label={`${monitorName} heartbeat history`}
    style={{ display: 'flex', gap: '1px', flexWrap: 'nowrap', overflowX: 'hidden', flex: 1 }}>
    {timeline.map((beat, i) => (
      <div
        key={i}
        role="listitem"
        aria-label={`${beat.time || `beat ${i}`}: ${BEAT_LABEL(beat.status)}${beat.ping ? ` ${beat.ping}ms` : ''}`}
        title={`${beat.time || ''} — ${BEAT_LABEL(beat.status)}${beat.ping ? ` (${beat.ping}ms)` : ''}`}
        style={{ width: 3, height: 16, backgroundColor: STATUS_COLOR[beat.status] ?? STATUS_COLOR[undefined], flexShrink: 0 }}
      />
    ))}
  </div>
);

export const UptimeTimelineWidget = ({ addLog }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showHealthy, setShowHealthy] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['uptime-history'],
    queryFn: async () => {
      const res = await fetch('/api/flask/uptime/history');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 300_000,
    onError: (err) => { if (addLog) addLog('UPTIME-KUMA', `Failed: ${err.message}`, 'warn'); },
  });

  const monitors = data?.monitors ?? [];
  const incident = monitors.filter(m => m.has_incident);
  const healthy  = monitors.filter(m => !m.has_incident);

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px' }}>

      <button
        onClick={() => setCollapsed(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ UPTIME_TIMELINE ◆ 7d_Heartbeat
        </span>
        {incident.length > 0 && (
          <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', borderRadius: 3,
            background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)',
            color: '#e74c3c', letterSpacing: '0.1em' }}>
            {incident.length} INCIDENT{incident.length !== 1 ? 'S' : ''}
          </span>
        )}
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 10 }}>
          {isLoading && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>
          )}
          {isError && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>
              {data?.error || 'UPTIME_KUMA_UNAVAILABLE'}
            </div>
          )}
          {!isLoading && !isError && monitors.length === 0 && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
              NO_MONITORS — check allowlist config or status page slug
            </div>
          )}

          {/* Incident monitors always shown */}
          {incident.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: healthy.length > 0 ? 8 : 0 }}>
              {incident.map(m => (
                <MonitorRow key={m.id} m={m} />
              ))}
            </div>
          )}

          {/* Healthy monitors behind fold */}
          {healthy.length > 0 && (
            <>
              <button
                onClick={() => setShowHealthy(v => !v)}
                style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{showHealthy ? '▾' : '▸'}</span>
                <span style={{ color: '#2ecc71' }}>✓</span>
                {healthy.length} service{healthy.length !== 1 ? 's' : ''} healthy
              </button>
              {showHealthy && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {healthy.map(m => <MonitorRow key={m.id} m={m} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MonitorRow = ({ m }) => {
  const dotColor = m.has_incident ? '#e74c3c' : '#2ecc71';
  // SYN-P1-12: icon alongside dot — WCAG 1.4.1
  const icon = m.has_incident ? '✗' : '✓';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      aria-label={`${m.name}: ${m.has_incident ? 'incident' : 'healthy'}, ${m.uptime_7d_pct !== null ? `${m.uptime_7d_pct}% uptime` : 'uptime unknown'}`}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 9, color: dotColor, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
        minWidth: 100, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {m.name}
      </span>
      <HeartbeatDots timeline={m.timeline} monitorName={m.name} />
      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)',
        flexShrink: 0, minWidth: 42, textAlign: 'right' }}>
        {m.uptime_7d_pct !== null ? `${m.uptime_7d_pct}%` : '—'}
      </span>
    </div>
  );
};

export default UptimeTimelineWidget;
