import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MONO = 'monospace';

export const LanPresenceWidget = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [wakeMsg, setWakeMsg] = useState({});   // hostId → message string
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lan-status'],
    queryFn: async () => {
      const res = await fetch('/api/lan/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const wake = async (hostId) => {
    setWakeMsg(m => ({ ...m, [hostId]: 'Sending…' }));
    try {
      const res = await fetch(`/api/lan/wake/${hostId}`, { method: 'POST' });
      const d = await res.json();
      if (d.already_online) {
        setWakeMsg(m => ({ ...m, [hostId]: 'Already online' }));
      } else if (d.sent) {
        setWakeMsg(m => ({ ...m, [hostId]: 'Wake sent — check in ~30s' }));
        setTimeout(() => qc.invalidateQueries(['lan-status']), 35_000);
      } else {
        setWakeMsg(m => ({ ...m, [hostId]: d.error || 'Error' }));
      }
    } catch {
      setWakeMsg(m => ({ ...m, [hostId]: 'Request failed' }));
    }
    setTimeout(() => setWakeMsg(m => { const n = {...m}; delete n[hostId]; return n; }), 6_000);
  };

  const hosts = data?.hosts ?? [];
  const offlineCount = hosts.filter(h => !h.online).length;

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>

      <button onClick={() => setCollapsed(v => !v)} aria-expanded={!collapsed}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ LAN_PRESENCE ◆ {hosts.length} hosts
        </span>
        {offlineCount > 0 && (
          <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', borderRadius: 3,
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)',
            color: '#fbbf24', letterSpacing: '0.1em' }}>
            {offlineCount} OFFLINE
          </span>
        )}
        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {isLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
          {isError  && <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>LAN_SIDECAR_UNAVAILABLE</div>}
          {hosts.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Status dot + icon */}
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: h.online ? '#4ade80' : '#f87171' }} />
              <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 9, color: h.online ? '#4ade80' : '#f87171', flexShrink: 0 }}>
                {h.online ? '✓' : '✗'}
              </span>
              {/* Label */}
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                {h.label}
              </span>
              {/* Latency */}
              <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', minWidth: 48, textAlign: 'right' }}>
                {h.online && h.latency_ms !== null ? `${h.latency_ms}ms` : h.online ? '—' : 'offline'}
              </span>
              {/* WoL button — only when offline AND mac configured */}
              {!h.online && h.mac && !h.mac.startsWith('XX:') ? (
                <button onClick={() => wake(h.id)} style={{
                  fontFamily: MONO, fontSize: 7, cursor: 'pointer',
                  padding: '2px 6px', borderRadius: 3,
                  border: '1px solid rgba(251,191,36,0.4)',
                  background: 'rgba(251,191,36,0.08)', color: '#fbbf24',
                }}>⚡ WAKE</button>
              ) : (
                <span style={{ minWidth: 48 }} />
              )}
              {/* Wake message */}
              {wakeMsg[h.id] && (
                <span style={{ fontFamily: MONO, fontSize: 7, color: '#fbbf24', position: 'absolute', right: 16 }}>
                  {wakeMsg[h.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanPresenceWidget;
