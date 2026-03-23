import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const MONO = 'monospace';
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

export const NtfyInboxWidget = ({ addLog }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [topic, setTopic] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ntfy-messages', topic, page],
    queryFn: async () => {
      const params = new URLSearchParams({ topic, page, limit: 20 });
      const res = await fetch(`/api/flask/ntfy/messages?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 60_000,
    onError: (err) => { if (addLog) addLog('NTFY', `Failed: ${err.message}`, 'warn'); },
  });

  const messages  = data?.messages ?? [];
  const topics    = data?.topics ?? [];
  const totalPages = data?.pages ?? 1;
  const unreadCount = messages.filter(m => m.time > getWatermark()).length;

  const handleExpand = () => {
    setCollapsed(false);
    setWatermark();
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px' }}>

      <button
        onClick={() => { setCollapsed(v => { if (v) setWatermark(); return !v; }); }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ NTFY_INBOX
        </span>
        {!collapsed && unreadCount > 0 && (
          <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', borderRadius: 3,
            background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.4)',
            color: '#fb923c', letterSpacing: '0.1em' }}>
            {unreadCount} NEW
          </span>
        )}
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 10 }}>
          {/* Topic tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['all', ...topics].map(t => (
              <button key={t} onClick={() => { setTopic(t); setPage(1); }}
                style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
                  padding: '2px 8px', borderRadius: 3, border: '1px solid',
                  borderColor: topic === t ? (TOPIC_COLORS[t] ?? 'rgba(6,182,212,0.5)') : 'rgba(255,255,255,0.1)',
                  background: topic === t ? `${TOPIC_COLORS[t] ?? '#06b6d4'}22` : 'transparent',
                  color: topic === t ? (TOPIC_COLORS[t] ?? '#38bdf8') : 'rgba(255,255,255,0.35)',
                }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {isLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
          {isError  && <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>NTFY_UNAVAILABLE</div>}

          {!isLoading && !isError && messages.length === 0 && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              NO_NOTIFICATIONS_YET
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.map((msg, i) => {
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
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      display: isExpanded ? 'block' : 'block' }}>
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
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{ fontFamily: MONO, fontSize: 8, color: page <= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                  background: 'none', border: 'none', cursor: page <= 1 ? 'default' : 'pointer' }}>← PREV</button>
              <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{ fontFamily: MONO, fontSize: 8, color: page >= totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                  background: 'none', border: 'none', cursor: page >= totalPages ? 'default' : 'pointer' }}>NEXT →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NtfyInboxWidget;
