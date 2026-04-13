import React, { useState, useEffect } from 'react';
import ContainerLogViewer from './ContainerLogViewer.jsx';

const ContainerProfile = ({ elementId }) => {
  const [dockerProfile, setDockerProfile] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [restartMsg, setRestartMsg] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (!elementId) { setDockerProfile(null); return; }
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/docker/status/${elementId}`);
        if (r.ok && alive) setDockerProfile(await r.json());
        else if (alive) setDockerProfile(null);
      } catch { if (alive) setDockerProfile(null); }
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [elementId]);

  const handleRestart = async () => {
    if (restarting || !elementId) return;
    setRestarting(true);
    setRestartMsg(null);
    try {
      const r = await fetch(`/api/docker/restart/${elementId}`, { method: 'POST' });
      const d = await r.json();
      setRestartMsg(r.ok ? '✓ RESTART_INITIATED' : `✗ ${d.error || 'FAILED'}`);
    } catch { setRestartMsg('✗ NETWORK_ERROR'); }
    setRestarting(false);
    setTimeout(() => setRestartMsg(null), 4000);
  };

  if (!dockerProfile) return null;

  return (
    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>CONTAINER_PROFILE</div>
      <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em',
          padding: '2px 6px', borderRadius: 2,
          background: dockerProfile.status === 'running' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
          border: `1px solid ${dockerProfile.status === 'running' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          color: dockerProfile.status === 'running' ? '#4ade80' : '#f87171',
        }}>{dockerProfile.status.toUpperCase()}</span>
        {dockerProfile.health !== 'none' && (
          <span style={{
            fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em',
            padding: '2px 6px', borderRadius: 2,
            background: dockerProfile.health === 'healthy' ? 'rgba(74,222,128,0.08)' : dockerProfile.health === 'starting' ? 'rgba(245,158,11,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${dockerProfile.health === 'healthy' ? 'rgba(74,222,128,0.25)' : dockerProfile.health === 'starting' ? 'rgba(245,158,11,0.25)' : 'rgba(248,113,113,0.25)'}`,
            color: dockerProfile.health === 'healthy' ? '#4ade80' : dockerProfile.health === 'starting' ? '#fbbf24' : '#f87171',
          }}>{dockerProfile.health.toUpperCase()}</span>
        )}
      </div>
      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginBottom: 2 }}>
        RESTARTS: {dockerProfile.restart_count}
        {dockerProfile.started_at ? (
          <span style={{ marginLeft: 10 }}>UP_SINCE: {new Date(dockerProfile.started_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        ) : null}
      </div>
      {dockerProfile.health_log?.length > 0 && (
        <div style={{ marginTop: 4, marginBottom: 6 }}>
          {dockerProfile.health_log.map((h, i) => (
            <div key={i} style={{ fontSize: 7, fontFamily: 'monospace', color: h.exit_code === 0 ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {h.exit_code === 0 ? '✓' : '✗'} {h.output || '—'}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleRestart}
        disabled={restarting}
        style={{
          marginTop: 4, fontFamily: 'monospace', fontSize: 8, cursor: restarting ? 'wait' : 'pointer',
          padding: '4px 10px', borderRadius: 3,
          border: '1px solid rgba(251,191,36,0.3)',
          background: 'rgba(251,191,36,0.06)',
          color: restarting ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.8)',
          opacity: restarting ? 0.5 : 1,
        }}
        aria-label={`Restart ${elementId} container`}
      >{restarting ? '⟳ RESTARTING…' : '⟳ RESTART'}</button>
      {restartMsg && (
        <div style={{ marginTop: 4, fontSize: 8, fontFamily: 'monospace',
          color: restartMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
          {restartMsg}
        </div>
      )}
      <button
        onClick={() => setShowLogs(v => !v)}
        style={{
          marginTop: 4, marginLeft: 6, fontFamily: 'monospace', fontSize: 8, cursor: 'pointer',
          padding: '4px 10px', borderRadius: 3,
          border: '1px solid rgba(96,165,250,0.3)',
          background: showLogs ? 'rgba(96,165,250,0.12)' : 'rgba(96,165,250,0.06)',
          color: 'rgba(96,165,250,0.8)',
        }}
        aria-label={`View logs for ${elementId}`}
      >{showLogs ? '▾ HIDE LOGS' : '▸ VIEW LOGS'}</button>
      {showLogs && <ContainerLogViewer containerName={elementId} onClose={() => setShowLogs(false)} />}
    </div>
  );
};

export default ContainerProfile;
