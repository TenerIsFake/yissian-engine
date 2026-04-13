import React from 'react';
import { motion } from 'framer-motion';

// Organic family — BIO, OCEAN, WEATHER, PLANET
// Rounded shapes, soft glows, flowing gradients, natural feel

const typeColor = (t) => {
  if (t === 'success') return '#34d399';
  if (t === 'error')   return '#fb7185';
  if (t === 'warn')    return '#fcd34d';
  return '#67e8f9';
};
const typeGlyph = (t) => {
  if (t === 'success') return '◉';
  if (t === 'error')   return '◌';
  if (t === 'warn')    return '◎';
  return '○';
};

export default function OrganicLog({ logs, title, filter, setFilter, expanded, setExpanded, services, visibleEntries }) {
  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid rgba(52,211,153,0.1)',
      background: 'linear-gradient(135deg, rgba(6,20,18,0.8) 0%, rgba(8,12,24,0.85) 100%)',
      overflow: 'hidden',
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        borderBottom: '1px solid rgba(52,211,153,0.06)',
        background: 'linear-gradient(90deg, rgba(52,211,153,0.03) 0%, transparent 100%)',
        fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(52,211,153,0.4)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(52,211,153,0.3)',
          boxShadow: '0 0 8px rgba(52,211,153,0.2)',
        }} />
        <span>{title ?? 'BIOSTREAM ◆ Organic_Signal_Feed'}</span>
        <span style={{
          marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(52,211,153,0.25)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          style={{
            fontFamily: 'monospace', fontSize: 8, color: 'rgba(52,211,153,0.4)',
            background: 'transparent', border: '1px solid rgba(52,211,153,0.12)',
            padding: '2px 8px', cursor: 'pointer', letterSpacing: 1,
            borderRadius: 10,
          }}>
          {expanded ? '▲ RETRACT' : '▼ EXPAND'}
        </button>
      </div>

      {/* Filters — pill-shaped */}
      <div style={{ display: 'flex', gap: 4, padding: '5px 12px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(52,211,153,0.04)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            style={{
              fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '3px 10px', cursor: 'pointer', borderRadius: 10,
              border: filter === s ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.06)',
              background: filter === s ? 'rgba(52,211,153,0.06)' : 'transparent',
              color: filter === s ? 'rgba(52,211,153,0.7)' : 'rgba(255,255,255,0.25)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div style={{
        padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3,
        overflowY: 'auto',
        height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease',
      }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            key={log.id}
            style={{
              display: 'flex', gap: 8, fontSize: 10, lineHeight: 1.4,
              padding: '2px 0',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{log.time}</span>
            <span style={{ color: typeColor(log.type), flexShrink: 0, fontSize: 8 }}>{typeGlyph(log.type)}</span>
            <span style={{ color: typeColor(log.type), fontWeight: 600, flexShrink: 0 }}>{log.service}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
