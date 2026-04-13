import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MONO } from '../utils/constants.js';
import { apiFetch } from '../utils/apiClient.js';

const SINCE_OPTIONS = [
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: 'All', value: '' },
];

function classifyLine(msg) {
  if (!msg) return 'default';
  const lower = msg.toLowerCase();
  if (lower.includes('error') || lower.includes('fatal') || lower.includes('exception')) return 'error';
  if (lower.includes('warn')) return 'warn';
  return 'default';
}

const LINE_COLORS = { error: '#ef4444', warn: '#eab308', default: 'rgba(255,255,255,0.6)' };

export default function ContainerLogViewer({ containerName, onClose }) {
  const [since, setSince] = useState('15m');
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['docker-logs', containerName, since],
    queryFn: () => apiFetch(`/api/docker/logs/${containerName}?lines=200${since ? '&since=' + since : ''}`),
    refetchInterval: autoRefresh ? 10_000 : false,
    enabled: !!containerName,
  });

  const lines = (data?.lines || []).filter(entry => {
    if (filter === 'all') return true;
    return classifyLine(entry.message) === filter;
  });

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines.length, autoScroll]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  };

  const chipStyle = (active) => ({
    fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', padding: '2px 6px', borderRadius: 3,
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
  });

  return (
    <div style={{ marginTop: 8, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
      background: 'rgba(0,0,0,0.3)', padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>LOGS</span>

        {SINCE_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setSince(s.value)} style={chipStyle(since === s.value)}>{s.label}</button>
        ))}

        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />

        {['all', 'error', 'warn'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={chipStyle(filter === f)}>
            {f === 'all' ? 'All' : f === 'error' ? 'Errors' : 'Warnings'}
          </button>
        ))}

        <label style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
            style={{ width: 10, height: 10 }} />
          Auto
        </label>

        <button onClick={onClose}
          style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      <div ref={scrollRef} onScroll={handleScroll}
        style={{ maxHeight: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: 9, lineHeight: 1.5 }}>
        {isLoading && <div style={{ color: 'rgba(255,255,255,0.2)', padding: 10 }}>Loading...</div>}
        {lines.map((entry, i) => (
          <div key={i} style={{ color: LINE_COLORS[classifyLine(entry.message)], padding: '1px 0', wordBreak: 'break-all' }}>
            {entry.timestamp && (
              <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>{entry.timestamp.slice(11, 19)}</span>
            )}
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!autoScroll && (
        <button onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView(); }}
          style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '2px 8px', marginTop: 4, cursor: 'pointer' }}>
          ↓ Scroll to bottom
        </button>
      )}
    </div>
  );
}
