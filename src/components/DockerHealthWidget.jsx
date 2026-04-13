import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MONO = 'monospace';

// ── Status colors (Uptime Kuma conventions) ──
const STATUS_COLOR = {
  1: '#2ecc71', 0: '#e74c3c', 2: '#f39c12', 3: '#95a5a6', undefined: '#2c3e50',
};
const BEAT_LABEL = (s) => s === 1 ? 'Up' : s === 0 ? 'Down' : s === 2 ? 'Pending' : s === 3 ? 'Maintenance' : 'Unknown';

const HeartbeatDots = ({ timeline, monitorName }) => (
  <div role="list" aria-label={`${monitorName} heartbeat history`}
    style={{ display: 'flex', gap: '1px', flexWrap: 'nowrap', overflowX: 'hidden', flex: 1 }}>
    {timeline.map((beat, i) => (
      <div key={i} role="listitem"
        aria-label={`${beat.time || `beat ${i}`}: ${BEAT_LABEL(beat.status)}${beat.ping ? ` ${beat.ping}ms` : ''}`}
        title={`${beat.time || ''} — ${BEAT_LABEL(beat.status)}${beat.ping ? ` (${beat.ping}ms)` : ''}`}
        style={{ width: 3, height: 16, backgroundColor: STATUS_COLOR[beat.status] ?? STATUS_COLOR[undefined], flexShrink: 0 }}
      />
    ))}
  </div>
);

const MonitorRow = ({ m }) => {
  const dotColor = m.has_incident ? '#e74c3c' : '#2ecc71';
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

/* ── Ntfy helpers ── */
const WATERMARK_KEY = 'ntfy-last-seen-ts';
const getWatermark = () => parseInt(localStorage.getItem(WATERMARK_KEY) || '0', 10);
const setWatermark = () => localStorage.setItem(WATERMARK_KEY, String(Math.floor(Date.now() / 1000)));
const PRIORITY_COLORS = { 1: '#95a5a6', 2: '#3498db', 3: 'rgba(255,255,255,0.8)', 4: '#fb923c', 5: '#e74c3c' };
const TOPIC_COLORS = { 'uptime-alerts': '#e74c3c', 'watchtower': '#3498db', 'srv1-alerts': '#f39c12' };
const relTime = (unixSec) => {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── Cron helpers ── */
const CRON_LABELS = {
  '0 3 * * *':   'Daily 3am',
  '*/5 * * * *': 'Every 5min',
  '0 8 * * *':   'Daily 8am',
  '0 4 * * 0':   'Weekly Sun 4am',
  '0 */6 * * *': 'Every 6h',
};
const cronRelTime = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const cronNextRel = (iso) => {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `in ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h ${m % 60}m`;
  return `in ${Math.floor(h / 24)}d`;
};

/* ── Docker container row ── */
const ContainerRow = ({ c }) => {
  const color = c.running ? '#4ade80' : '#f87171';
  const healthColor = c.health === 'healthy' ? '#4ade80' : c.health === 'unhealthy' ? '#f87171' : 'rgba(255,255,255,0.25)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {c.name}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 7, color: healthColor, flexShrink: 0 }}>
        {c.health === 'healthy' ? 'HEALTHY' : c.health === 'unhealthy' ? 'UNHEALTHY' : c.running ? 'RUNNING' : 'STOPPED'}
      </span>
      {c.restart_count > 0 && (
        <span style={{ fontFamily: MONO, fontSize: 7, color: '#fb923c', flexShrink: 0 }}>
          ↻{c.restart_count}
        </span>
      )}
    </div>
  );
};

export const DockerHealthWidget = ({ addLog, headerLabel, lanLabel, cronLabel }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showHealthy, setShowHealthy] = useState(false);
  const [activeTab, setActiveTab] = useState('docker'); // 'docker' | 'uptime' | 'ntfy' | 'lan' | 'cron'

  /* ── Docker data ── */
  const { data: dockerData, isLoading: dockerLoading, isError: dockerError } = useQuery({
    queryKey: ['docker-health'],
    queryFn: async () => {
      const res = await fetch('/api/flask/docker/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 60_000,
    onError: (err) => { if (addLog) addLog('DOCKER-HEALTH', `Failed: ${err.message}`, 'warn'); },
  });

  /* ── Uptime data ── */
  const { data: uptimeData, isLoading: uptimeLoading, isError: uptimeError } = useQuery({
    queryKey: ['uptime-history'],
    queryFn: async () => {
      const res = await fetch('/api/flask/uptime/history');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 300_000,
    onError: (err) => { if (addLog) addLog('UPTIME-KUMA', `Failed: ${err.message}`, 'warn'); },
  });

  /* ── Ntfy data ── */
  const [ntfyTopic, setNtfyTopic] = useState('all');
  const [ntfyPage, setNtfyPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const { data: ntfyData, isLoading: ntfyLoading, isError: ntfyError } = useQuery({
    queryKey: ['ntfy-messages', ntfyTopic, ntfyPage],
    queryFn: async () => {
      const params = new URLSearchParams({ topic: ntfyTopic, page: ntfyPage, limit: 20 });
      const res = await fetch(`/api/flask/ntfy/messages?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 60_000,
    onError: (err) => { if (addLog) addLog('NTFY', `Failed: ${err.message}`, 'warn'); },
  });

  /* ── LAN data ── */
  const [wakeMsg, setWakeMsg] = useState({});
  const qc = useQueryClient();
  const { data: lanData, isLoading: lanLoading, isError: lanError } = useQuery({
    queryKey: ['lan-status'],
    queryFn: async () => {
      const res = await fetch('/api/lan/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
    onError: (err) => { if (addLog) addLog('LAN-PRESENCE', `Failed: ${err.message}`, 'warn'); },
  });

  const wake = async (hostId) => {
    setWakeMsg(m => ({ ...m, [hostId]: 'Sending…' }));
    try {
      const res = await fetch(`/api/lan/wake/${hostId}`, { method: 'POST' });
      const d = await res.json();
      if (d.already_online) setWakeMsg(m => ({ ...m, [hostId]: 'Already online' }));
      else if (d.sent) {
        setWakeMsg(m => ({ ...m, [hostId]: 'Wake sent — check in ~30s' }));
        setTimeout(() => qc.invalidateQueries(['lan-status']), 35_000);
      } else setWakeMsg(m => ({ ...m, [hostId]: d.error || 'Error' }));
    } catch { setWakeMsg(m => ({ ...m, [hostId]: 'Request failed' })); }
    setTimeout(() => setWakeMsg(m => { const n = {...m}; delete n[hostId]; return n; }), 6_000);
  };

  /* ── Cron data ── */
  const [cronTab, setCronTab] = useState('schedule');
  const { data: cronData, isLoading: cronLoading, isError: cronError } = useQuery({
    queryKey: ['cron-status'],
    queryFn: async () => {
      const res = await fetch('/api/flask/cron/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
    onError: (err) => { if (addLog) addLog('CRON-MONITOR', `Failed: ${err.message}`, 'warn'); },
  });

  // Docker
  const containers = dockerData?.containers ?? [];
  const dockerHealthy = containers.filter(c => c.running);
  const dockerUnhealthy = containers.filter(c => !c.running);

  // Uptime
  const monitors = uptimeData?.monitors ?? [];
  const incident = monitors.filter(m => m.has_incident);
  const healthy  = monitors.filter(m => !m.has_incident);

  // Ntfy
  const ntfyMessages  = ntfyData?.messages ?? [];
  const ntfyTopics    = ntfyData?.topics ?? [];
  const ntfyTotalPages = ntfyData?.pages ?? 1;
  const unreadCount = ntfyMessages.filter(m => m.time > getWatermark()).length;

  // LAN
  const hosts = lanData?.hosts ?? [];
  const offlineCount = hosts.filter(h => !h.online).length;

  // Cron
  const cronJobs = cronData?.jobs ?? [];

  const TAB_STYLE = (active) => ({
    fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
    padding: '3px 10px', borderRadius: 4, border: '1px solid',
    borderColor: active ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)',
    background: active ? 'rgba(6,182,212,0.1)' : 'transparent',
    color: active ? '#38bdf8' : 'rgba(255,255,255,0.35)',
  });

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px' }}>

      {/* Header row with collapse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 8 }}>
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            background: 'none', border: 'none', padding: 0, textAlign: 'left', flex: 1 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
            {headerLabel || '◆ DOCKER_HEALTH ◆ Infrastructure'}
          </span>
          {dockerUnhealthy.length > 0 && (
            <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', borderRadius: 3,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171', letterSpacing: '0.1em' }}>
              {dockerUnhealthy.length} DOWN
            </span>
          )}
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
      </div>

      {!collapsed && (
        <>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button onClick={() => setActiveTab('docker')} style={TAB_STYLE(activeTab === 'docker')}>
              DOCKER
              {dockerUnhealthy.length > 0 && (
                <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 7, padding: '0 4px', borderRadius: 3,
                  background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {dockerUnhealthy.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('uptime')} style={TAB_STYLE(activeTab === 'uptime')}>
              UPTIME
            </button>
            <button onClick={() => { setActiveTab('ntfy'); setWatermark(); }} style={TAB_STYLE(activeTab === 'ntfy')}>
              NTFY
              {activeTab !== 'ntfy' && unreadCount > 0 && (
                <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 7, padding: '0 4px', borderRadius: 3,
                  background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('lan')} style={TAB_STYLE(activeTab === 'lan')}>
              LAN
              {offlineCount > 0 && (
                <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 7, padding: '0 4px', borderRadius: 3,
                  background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                  {offlineCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('cron')} style={TAB_STYLE(activeTab === 'cron')}>
              CRON
              {cronJobs.length > 0 && (
                <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 7, padding: '0 4px', borderRadius: 3,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                  {cronJobs.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Docker tab ── */}
          {activeTab === 'docker' && (
            <div>
              {dockerLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
              {dockerError && <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>DOCKER_MONITOR_UNAVAILABLE</div>}
              {!dockerLoading && !dockerError && containers.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO_CONTAINERS</div>
              )}

              {/* Summary bar */}
              {containers.length > 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  <span style={{ color: '#4ade80' }}>{dockerHealthy.length} RUNNING</span>
                  {dockerUnhealthy.length > 0 && (
                    <span style={{ color: '#f87171', marginLeft: 8 }}>{dockerUnhealthy.length} STOPPED</span>
                  )}
                  <span style={{ marginLeft: 8 }}>/ {containers.length} TOTAL</span>
                </div>
              )}

              {/* Stopped containers first */}
              {dockerUnhealthy.map(c => <ContainerRow key={c.name} c={c} />)}

              {/* Running containers (collapsible) */}
              {dockerHealthy.length > 0 && (
                <>
                  <button
                    onClick={() => setShowHealthy(v => !v)}
                    style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                      display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{showHealthy ? '▾' : '▸'}</span>
                    <span style={{ color: '#4ade80' }}>✓</span>
                    {dockerHealthy.length} container{dockerHealthy.length !== 1 ? 's' : ''} running
                  </button>
                  {showHealthy && dockerHealthy.map(c => <ContainerRow key={c.name} c={c} />)}
                </>
              )}
            </div>
          )}

          {/* ── Uptime tab ── */}
          {activeTab === 'uptime' && (
            <div>
              {uptimeLoading && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>
              )}
              {uptimeError && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>
                  {uptimeData?.error || 'UPTIME_KUMA_UNAVAILABLE'}
                </div>
              )}
              {!uptimeLoading && !uptimeError && monitors.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
                  NO_MONITORS — check allowlist config or status page slug
                </div>
              )}
              {incident.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: healthy.length > 0 ? 8 : 0 }}>
                  {incident.map(m => <MonitorRow key={m.id} m={m} />)}
                </div>
              )}
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

          {/* ── Ntfy tab ── */}
          {activeTab === 'ntfy' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {['all', ...ntfyTopics].map(t => (
                  <button key={t} onClick={() => { setNtfyTopic(t); setNtfyPage(1); }}
                    style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
                      padding: '2px 8px', borderRadius: 3, border: '1px solid',
                      borderColor: ntfyTopic === t ? (TOPIC_COLORS[t] ?? 'rgba(6,182,212,0.5)') : 'rgba(255,255,255,0.1)',
                      background: ntfyTopic === t ? `${TOPIC_COLORS[t] ?? '#06b6d4'}22` : 'transparent',
                      color: ntfyTopic === t ? (TOPIC_COLORS[t] ?? '#38bdf8') : 'rgba(255,255,255,0.35)',
                    }}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              {ntfyLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
              {ntfyError  && <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>NTFY_UNAVAILABLE</div>}
              {!ntfyLoading && !ntfyError && ntfyMessages.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                  NO_NOTIFICATIONS_YET
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ntfyMessages.map((msg, i) => {
                  const isNew = msg.time > getWatermark();
                  const isExpanded = expandedIdx === i;
                  const prioColor = PRIORITY_COLORS[msg.priority] ?? 'rgba(255,255,255,0.7)';
                  const topicColor = TOPIC_COLORS[msg._topic] ?? 'rgba(255,255,255,0.3)';
                  return (
                    <div key={i}
                      onClick={() => setExpandedIdx(isExpanded ? null : i)}
                      style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                        background: isNew ? 'rgba(251,146,60,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isNew ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: MONO, fontSize: 7, color: topicColor, flexShrink: 0 }}>
                          {(msg._topic || '').toUpperCase()}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: prioColor, flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                          {msg.title || msg.message || '(no title)'}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                          {msg.time ? relTime(msg.time) : ''}
                        </span>
                      </div>
                      {isExpanded && msg.message && msg.message !== msg.title && (
                        <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)',
                          marginTop: 4, lineHeight: 1.5 }}>
                          {msg.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {ntfyTotalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <button onClick={() => setNtfyPage(p => Math.max(1, p - 1))} disabled={ntfyPage <= 1}
                    style={{ fontFamily: MONO, fontSize: 8, color: ntfyPage <= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                      background: 'none', border: 'none', cursor: ntfyPage <= 1 ? 'default' : 'pointer' }}>← PREV</button>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                    {ntfyPage} / {ntfyTotalPages}
                  </span>
                  <button onClick={() => setNtfyPage(p => Math.min(ntfyTotalPages, p + 1))} disabled={ntfyPage >= ntfyTotalPages}
                    style={{ fontFamily: MONO, fontSize: 8, color: ntfyPage >= ntfyTotalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                      background: 'none', border: 'none', cursor: ntfyPage >= ntfyTotalPages ? 'default' : 'pointer' }}>NEXT →</button>
                </div>
              )}
            </div>
          )}

          {/* ── LAN tab ── */}
          {activeTab === 'lan' && (
            <div>
              {lanLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
              {lanError && <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>LAN_SIDECAR_UNAVAILABLE</div>}
              {!lanLoading && !lanError && hosts.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO_HOSTS</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {hosts.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: h.online ? '#4ade80' : '#f87171' }} />
                    <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 9, color: h.online ? '#4ade80' : '#f87171', flexShrink: 0 }}>
                      {h.online ? '✓' : '✗'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                      {h.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', minWidth: 48, textAlign: 'right' }}>
                      {h.online && h.latency_ms !== null ? `${h.latency_ms}ms` : h.online ? '—' : 'offline'}
                    </span>
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
                    {wakeMsg[h.id] && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: '#fbbf24' }}>
                        {wakeMsg[h.id]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Cron tab ── */}
          {activeTab === 'cron' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {['schedule', 'recent runs'].map(t => (
                  <button key={t} onClick={() => setCronTab(t)} style={{
                    fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
                    padding: '2px 6px', borderRadius: 3, border: '1px solid',
                    borderColor: cronTab === t ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
                    background: cronTab === t ? 'rgba(6,182,212,0.08)' : 'transparent',
                    color: cronTab === t ? '#38bdf8' : 'rgba(255,255,255,0.35)',
                  }}>{t.toUpperCase()}</button>
                ))}
              </div>

              {cronLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING…</div>}
              {cronError && <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>CRON_UNAVAILABLE</div>}

              {cronTab === 'schedule' && !cronLoading && !cronError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 7,
                    color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 2 }}>
                    <span style={{ flex: 2 }}>JOB</span>
                    <span style={{ flex: 2 }}>SCHEDULE</span>
                    <span style={{ flex: 2 }}>NEXT RUN</span>
                  </div>
                  {cronJobs.map(j => (
                    <div key={j.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
                        flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}</span>
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)', flex: 2 }}>
                        {CRON_LABELS[j.cron] ?? j.cron}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.5)', flex: 2 }}
                        title={j.next_run ?? ''}>
                        {cronNextRel(j.next_run)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {cronTab === 'recent runs' && !cronLoading && !cronError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 7,
                    color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 2 }}>
                    <span style={{ flex: 2 }}>JOB</span>
                    <span style={{ flex: 2 }}>LAST RUN</span>
                    <span style={{ flex: 1 }}>NOTE</span>
                  </div>
                  {cronJobs.map(j => (
                    <div key={j.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
                        flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}</span>
                      <span style={{ fontFamily: MONO, fontSize: 7, flex: 2,
                        color: j.last_run ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                        title={j.last_run ?? ''}>
                        {cronRelTime(j.last_run)}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 7, flex: 1,
                        color: j.restart_count != null ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {j.restart_count != null ? `restarts:${j.restart_count}` : (j.last_line ? '✓' : '—')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DockerHealthWidget;
