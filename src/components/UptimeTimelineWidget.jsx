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

export const UptimeTimelineWidget = ({ addLog, headerLabel }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showHealthy, setShowHealthy] = useState(false);
  const [activeTab, setActiveTab] = useState('uptime'); // 'uptime' | 'ntfy'

  /* ── Uptime data ── */
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

  const monitors = data?.monitors ?? [];
  const incident = monitors.filter(m => m.has_incident);
  const healthy  = monitors.filter(m => !m.has_incident);

  const ntfyMessages  = ntfyData?.messages ?? [];
  const ntfyTopics    = ntfyData?.topics ?? [];
  const ntfyTotalPages = ntfyData?.pages ?? 1;
  const unreadCount = ntfyMessages.filter(m => m.time > getWatermark()).length;

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

      {/* Header row with collapse + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 8 }}>
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            background: 'none', border: 'none', padding: 0, textAlign: 'left', flex: 1 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
            {headerLabel || '◆ UPTIME_TIMELINE ◆ 7d_Heartbeat'}
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
      </div>

      {!collapsed && (
        <>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
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
          </div>

          {/* ── Uptime tab ── */}
          {activeTab === 'uptime' && (
            <div>
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

              {incident.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: healthy.length > 0 ? 8 : 0 }}>
                  {incident.map(m => (
                    <MonitorRow key={m.id} m={m} />
                  ))}
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
              {/* Topic filter tabs */}
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

              {/* Pagination */}
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
        </>
      )}
    </div>
  );
};

export default UptimeTimelineWidget;
