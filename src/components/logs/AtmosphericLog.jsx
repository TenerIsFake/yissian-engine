import React from 'react';
import { motion } from 'framer-motion';

// Atmospheric family — SPACE, GLOBE
// Translucent panels, starfield-like dot accents, wide/airy spacing

const typeColor = (t) => {
  if (t === 'success') return '#a78bfa';
  if (t === 'error')   return '#f87171';
  if (t === 'warn')    return '#fde68a';
  return '#93c5fd';
};
const typeGlyph = (t) => {
  if (t === 'success') return '✦';
  if (t === 'error')   return '✕';
  if (t === 'warn')    return '△';
  return '·';
};

export default function AtmosphericLog({ logs, title, filter, setFilter, expanded, setExpanded, services, visibleEntries }) {
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(147,197,253,0.08)',
      background: 'rgba(5,5,20,0.6)',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden',
      fontFamily: 'monospace',
    }}>
      {/* Header — observatory style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        borderBottom: '1px solid rgba(147,197,253,0.06)',
        background: 'linear-gradient(90deg, rgba(147,197,253,0.02) 0%, rgba(167,139,250,0.02) 100%)',
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'rgba(147,197,253,0.35)',
      }}>
        <span style={{ fontSize: 10, opacity: 0.4 }}>✧</span>
        <span>{title ?? 'TELEMETRY ◆ Atmospheric_Stream'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center' }}>
          {/* Signal dots */}
          {[0.2, 0.35, 0.5].map((o, i) => (
            <span key={i} style={{
              width: 3, height: 3, borderRadius: '50%',
              background: `rgba(147,197,253,${o})`,
            }} />
          ))}
        </div>
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          style={{
            fontFamily: 'monospace', fontSize: 8, color: 'rgba(147,197,253,0.35)',
            background: 'transparent', border: '1px solid rgba(147,197,253,0.1)',
            padding: '2px 8px', cursor: 'pointer', letterSpacing: 1,
            borderRadius: 8,
          }}>
          {expanded ? '▲ RETRACT' : '▼ EXTEND'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, padding: '5px 12px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(147,197,253,0.04)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            style={{
              fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '3px 9px', cursor: 'pointer', borderRadius: 8,
              border: filter === s ? '1px solid rgba(147,197,253,0.18)' : '1px solid rgba(255,255,255,0.04)',
              background: filter === s ? 'rgba(147,197,253,0.05)' : 'transparent',
              color: filter === s ? 'rgba(147,197,253,0.65)' : 'rgba(255,255,255,0.2)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div style={{
        padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        overflowY: 'auto',
        height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease',
      }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            key={log.id}
            style={{
              display: 'flex', gap: 10, fontSize: 10, lineHeight: 1.5,
              padding: '1px 0',
            }}
          >
            <span style={{ color: 'rgba(147,197,253,0.15)', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>{log.time}</span>
            <span style={{ color: typeColor(log.type), flexShrink: 0 }}>{typeGlyph(log.type)}</span>
            <span style={{ color: typeColor(log.type), fontWeight: 600, flexShrink: 0 }}>{log.service}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
