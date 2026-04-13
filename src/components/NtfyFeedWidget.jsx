import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MONO } from '../utils/constants.js';
import { apiFetch } from '../utils/apiClient.js';

const TOPIC_COLORS = { 'uptime-alerts': '#ef4444', watchtower: '#3b82f6' };
const TABS = ['All', 'Alerts', 'Updates'];
const TOPIC_MAP = { Alerts: 'uptime-alerts', Updates: 'watchtower' };

function relativeTime(ts) {
  if (!ts) return '';
  const diff = (Date.now() / 1000) - ts;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function priorityIcon(p) {
  if (p >= 5) return '🔴';
  if (p >= 4) return '🟠';
  if (p >= 3) return '🟡';
  return '⚪';
}

export default function NtfyFeedWidget() {
  const [tab, setTab] = useState('All');
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ntfy-dismissed') || '[]')); }
    catch { return new Set(); }
  });

  const topicParam = TOPIC_MAP[tab] || '';
  const { data } = useQuery({
    queryKey: ['ntfy-messages', topicParam],
    queryFn: () => apiFetch(`/api/ntfy/messages?limit=20${topicParam ? '&topic=' + topicParam : ''}`),
    refetchInterval: 120_000,
  });

  const messages = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(m => !dismissed.has(m.id));
  }, [data, dismissed]);

  const dismiss = (id) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('ntfy-dismissed', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ NOTIFICATIONS ◆
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
          {messages.length} unread
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em', padding: '3px 8px', borderRadius: 4,
              background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: tab === t ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: 20 }}>
            No recent notifications
          </div>
        ) : messages.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 10, flexShrink: 0, animation: m.priority >= 5 ? 'pulse 1.5s infinite' : undefined }}>
              {priorityIcon(m.priority || 3)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                {m.title || m.message?.slice(0, 60) || 'Notification'}
              </div>
              {m.message && m.title && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  {m.message.slice(0, 80)}{m.message.length > 80 ? '...' : ''}
                </div>
              )}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 4px', borderRadius: 3, flexShrink: 0,
              background: TOPIC_COLORS[m.topic] || '#4b5563', color: 'rgba(255,255,255,0.7)' }}>
              {m.topic || 'general'}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.25)', flexShrink: 0, minWidth: 36, textAlign: 'right' }}>
              {relativeTime(m.time)}
            </span>
            <button onClick={() => dismiss(m.id)}
              style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 2px', flexShrink: 0 }}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
