import React from 'react';
import { motion } from 'framer-motion';

// Mechanical family — FORGE, BAND, VINYL, MOLECULE
// Riveted panels, industrial type, gauge-like accents, brushed metal feel

const typeColor = (t) => {
  if (t === 'success') return '#86efac';
  if (t === 'error')   return '#ef4444';
  if (t === 'warn')    return '#f59e0b';
  return '#a8a29e';
};
const typeGlyph = (t) => {
  if (t === 'success') return '▣';
  if (t === 'error')   return '▧';
  if (t === 'warn')    return '▤';
  return '▪';
};

export default function MechanicalLog({ logs, title, filter, setFilter, expanded, setExpanded, services, visibleEntries }) {
  return (
    <div style={{
      borderRadius: 3,
      border: '1px solid rgba(168,162,158,0.12)',
      background: 'rgba(18,16,14,0.85)',
      overflow: 'hidden',
      fontFamily: 'monospace',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      {/* Header — industrial panel */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        borderBottom: '2px solid rgba(168,162,158,0.08)',
        background: 'linear-gradient(180deg, rgba(60,55,50,0.2) 0%, rgba(30,28,25,0.3) 100%)',
        fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: 'rgba(168,162,158,0.45)',
      }}>
        {/* Rivet decorations */}
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(168,162,158,0.12)', border: '1px solid rgba(168,162,158,0.08)' }} />
        <span>{title ?? 'MECH_LOG ◆ Workshop_Output'}</span>
        <span style={{ marginLeft: 'auto' }} />
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          style={{
            fontFamily: 'monospace', fontSize: 8, color: 'rgba(168,162,158,0.4)',
            background: 'rgba(168,162,158,0.04)',
            border: '1px solid rgba(168,162,158,0.1)',
            padding: '2px 8px', cursor: 'pointer', letterSpacing: 1,
            borderRadius: 2,
          }}>
          {expanded ? '▲ RETRACT' : '▼ EXTEND'}
        </button>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(168,162,158,0.12)', border: '1px solid rgba(168,162,158,0.08)' }} />
      </div>

      {/* Filters — toggle switches */}
      <div style={{ display: 'flex', gap: 2, padding: '4px 8px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(168,162,158,0.05)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            style={{
              fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em',
              padding: '3px 8px', cursor: 'pointer', borderRadius: 1,
              border: filter === s ? '1px solid rgba(168,162,158,0.2)' : '1px solid rgba(255,255,255,0.04)',
              background: filter === s ? 'rgba(168,162,158,0.08)' : 'transparent',
              color: filter === s ? 'rgba(168,162,158,0.7)' : 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div style={{
        padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2,
        overflowY: 'auto',
        height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease',
      }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            style={{
              display: 'flex', gap: 6, fontSize: 10, lineHeight: 1.4,
              padding: '1px 0',
              borderLeft: `2px solid ${typeColor(log.type)}22`,
              paddingLeft: 6,
            }}
          >
            <span style={{ color: 'rgba(168,162,158,0.2)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{log.time}</span>
            <span style={{ color: typeColor(log.type), flexShrink: 0, fontSize: 9 }}>{typeGlyph(log.type)}</span>
            <span style={{ color: typeColor(log.type), fontWeight: 700, flexShrink: 0 }}>{log.service}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
