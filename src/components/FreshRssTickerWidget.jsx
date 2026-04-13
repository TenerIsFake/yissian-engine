import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const FreshRssTickerWidget = ({ headerLabel }) => {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const { data, isError } = useQuery({
    queryKey: ['freshrss-headlines'],
    queryFn: () => fetch('/api/flask/freshrss/headlines?limit=20').then(r => r.json()),
    refetchInterval: 15 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const items = Array.isArray(data) ? data : [];
  const unreadCount = items.filter(i => !i.is_read).length;
  // duplicate items for seamless loop
  const doubled = [...items, ...items];

  useEffect(() => {
    if (prefersReducedMotion || collapsed) return;
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const tick = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        pos += 0.5;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [collapsed, items.length]);

  if (isError || (data && data.error)) return null;
  if (items.length === 0) return null;

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 8 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.25em' }}>
          {headerLabel || '◆ NEWS_FEED ◆ FreshRSS'}
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8, background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)',
              color: '#38bdf8', padding: '0 5px', borderRadius: 10, fontSize: 7 }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <button onClick={() => setCollapsed(c => !c)} style={{
          fontFamily: 'monospace', fontSize: 7, cursor: 'pointer',
          background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
          color: 'rgba(255,255,255,0.3)', padding: '1px 6px',
        }}>{collapsed ? '▼' : '▲'}</button>
      </div>
      {!collapsed && (
        <div
          ref={scrollRef}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          style={{ display: 'flex', gap: 16, overflowX: 'hidden', cursor: 'default' }}
        >
          {doubled.map((item, i) => (
            <a key={i} href={item.url || '#'} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                textDecoration: 'none', padding: '4px 10px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.07)' }}>
              {item.source && (
                <span style={{ fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.1em',
                  color: '#38bdf8', background: 'rgba(6,182,212,0.1)',
                  border: '1px solid rgba(6,182,212,0.25)', borderRadius: 3, padding: '0 4px',
                  flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.source}
                </span>
              )}
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: item.is_read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                whiteSpace: 'nowrap', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
              {item.published_at > 0 && (
                <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {Math.round((Date.now() / 1000 - item.published_at) / 3600)}h
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreshRssTickerWidget;
