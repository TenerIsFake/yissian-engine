import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/apiClient.js';

const MONO = 'monospace';
const DENYLIST = new Set(['gluetun', 'socket-proxy', 'docker-monitor', 'restic-sidecar', 'flask-backend', 'homepage']);

function relTime(ts) {
  if (!ts) return '—';
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DeployControlPanel() {
  const [selected, setSelected] = useState(new Set());
  const [buildFlag, setBuildFlag] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState('deploy'); // deploy | history
  const logRef = useRef(null);

  // Fetch container list for service selector
  const { data: containers } = useQuery({
    queryKey: ['deploy-containers'],
    queryFn: () => apiFetch('/api/docker/containers'),
    refetchInterval: 60_000,
  });

  const deployable = (Array.isArray(containers) ? containers : [])
    .map(c => c.name || c.Names?.[0]?.replace(/^\//, ''))
    .filter(n => n && !DENYLIST.has(n))
    .sort();

  // Poll active deploy status
  const { data: statusData } = useQuery({
    queryKey: ['deploy-status', activeId],
    queryFn: () => apiFetch(`/api/flask/deploy/status/${activeId}`),
    enabled: !!activeId,
    refetchInterval: activeId ? 2000 : false,
  });

  // Stop polling when deploy completes
  useEffect(() => {
    if (statusData?.status === 'success' || statusData?.status === 'failed') {
      // Keep ID for log viewing but stop is handled by react-query enabled check
    }
  }, [statusData]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [statusData?.logTail]);

  // Deploy history
  const { data: history } = useQuery({
    queryKey: ['deploy-history'],
    queryFn: () => apiFetch('/api/flask/deploy/history'),
    refetchInterval: 30_000,
  });

  const toggleService = (name) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleDeploy = async () => {
    setConfirmOpen(false);
    try {
      const res = await fetch('/api/flask/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: [...selected], build: buildFlag }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveId(data.id);
        setTab('deploy');
      } else {
        alert(data.error || 'Deploy failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const isActive = activeId && statusData && (statusData.status === 'queued' || statusData.status === 'running');

  const labelStyle = { fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' };
  const btnBase = { fontFamily: MONO, fontSize: 8, padding: '4px 10px', borderRadius: 3, cursor: 'pointer', border: '1px solid' };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
        ◆ DEPLOY CONTROL ◆
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['deploy', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...btnBase,
            borderColor: tab === t ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)',
            background: tab === t ? 'rgba(96,165,250,0.1)' : 'transparent',
            color: tab === t ? 'rgba(96,165,250,0.9)' : 'rgba(255,255,255,0.4)',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === 'deploy' && (
        <>
          {/* Service selector */}
          <div style={{ ...labelStyle, marginBottom: 4 }}>SELECT SERVICES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {deployable.map(name => (
              <button key={name} onClick={() => toggleService(name)} style={{
                ...btnBase,
                borderColor: selected.has(name) ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)',
                background: selected.has(name) ? 'rgba(74,222,128,0.08)' : 'transparent',
                color: selected.has(name) ? '#4ade80' : 'rgba(255,255,255,0.4)',
              }}>{name}</button>
            ))}
          </div>

          {/* Build toggle + deploy button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={buildFlag} onChange={e => setBuildFlag(e.target.checked)} />
              --BUILD
            </label>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={selected.size === 0 || isActive}
              style={{
                ...btnBase,
                borderColor: selected.size === 0 || isActive ? 'rgba(255,255,255,0.1)' : 'rgba(251,191,36,0.4)',
                background: isActive ? 'rgba(255,255,255,0.03)' : 'rgba(251,191,36,0.06)',
                color: selected.size === 0 || isActive ? 'rgba(255,255,255,0.2)' : 'rgba(251,191,36,0.9)',
                cursor: selected.size === 0 || isActive ? 'not-allowed' : 'pointer',
              }}
            >{isActive ? '⟳ DEPLOYING…' : '▶ DEPLOY'}</button>
          </div>

          {/* Confirmation modal */}
          {confirmOpen && (
            <div style={{
              padding: 12, marginBottom: 10, borderRadius: 6,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(251,191,36,0.9)', marginBottom: 8 }}>
                {buildFlag ? 'REBUILD' : 'DEPLOY'} {[...selected].join(', ')}?
                {buildFlag && <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Includes Docker image build (~30-120s)</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDeploy} style={{ ...btnBase, borderColor: 'rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: '#4ade80' }}>CONFIRM</button>
                <button onClick={() => setConfirmOpen(false)} style={{ ...btnBase, borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }}>CANCEL</button>
              </div>
            </div>
          )}

          {/* Live log */}
          {activeId && statusData && (
            <div style={{ marginTop: 8 }}>
              <div style={{ ...labelStyle, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>STATUS: {(statusData.status || 'unknown').toUpperCase()}</span>
                {statusData.status === 'success' && <span style={{ color: '#4ade80' }}>✓</span>}
                {statusData.status === 'failed' && <span style={{ color: '#f87171' }}>✗</span>}
                {(statusData.status === 'queued' || statusData.status === 'running') && <span style={{ color: '#fbbf24' }}>⟳</span>}
                {statusData.duration != null && <span>{statusData.duration}s</span>}
              </div>
              {statusData.logTail && (
                <div ref={logRef} style={{
                  fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4, padding: 8, maxHeight: 200, overflowY: 'auto',
                  whiteSpace: 'pre-wrap', lineHeight: 1.5,
                }}>
                  {statusData.logTail.map((line, i) => (
                    <div key={i} style={{
                      color: /error|fail/i.test(line) ? 'rgba(248,113,113,0.8)' :
                             /warn/i.test(line) ? 'rgba(251,191,36,0.8)' :
                             /recreated|started|reloaded/i.test(line) ? 'rgba(74,222,128,0.7)' :
                             'rgba(255,255,255,0.5)',
                    }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div>
          {(!history || history.length === 0) ? (
            <div style={labelStyle}>NO DEPLOY HISTORY</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 7, padding: '2px 6px', borderRadius: 2,
                    background: h.status === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${h.status === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    color: h.status === 'success' ? '#4ade80' : '#f87171',
                  }}>{h.status === 'success' ? '✓' : '✗'}</span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.5)', flex: 1 }}>
                    {(h.services || []).join(', ')}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                    {h.build ? 'BUILD' : 'DEPLOY'}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                    {h.duration}s
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>
                    {relTime(h.startedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
