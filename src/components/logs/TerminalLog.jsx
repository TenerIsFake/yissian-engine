import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

// Terminal family — CHEM, NEURAL, AIRPORT, PARTICLE
// Monospace console, blinking cursor, green-tinted scan lines

const typeColor = (t) => {
  if (t === 'success') return '#4ade80';
  if (t === 'error')   return '#f87171';
  if (t === 'warn')    return '#fbbf24';
  return '#22d3ee';
};
const typeGlyph = (t) => {
  if (t === 'success') return '✓';
  if (t === 'error')   return '✗';
  if (t === 'warn')    return '⚠';
  return '›';
};

export default function TerminalLog({ logs, title, filter, setFilter, expanded, setExpanded, services, visibleEntries }) {
  return (
    <div style={{
      borderRadius: 6,
      border: '1px solid rgba(34,211,238,0.12)',
      background: 'rgba(0,0,0,0.65)',
      overflow: 'hidden',
      fontFamily: 'monospace',
      position: 'relative',
    }}>
      {/* Scan-line overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.015) 2px, rgba(0,255,200,0.015) 4px)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px',
        borderBottom: '1px solid rgba(34,211,238,0.08)',
        background: 'rgba(34,211,238,0.03)',
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'rgba(34,211,238,0.5)',
      }}>
        <Terminal size={10} style={{ opacity: 0.6 }} />
        <span>{title ?? 'SYSTEM_LOG ◆ Terminal_Output'}</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(34,211,238,0.3)', animation: 'blink 1s step-end infinite' }}>█</span>
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          style={{
            fontFamily: 'monospace', fontSize: 8, color: 'rgba(34,211,238,0.4)',
            background: 'transparent', border: '1px solid rgba(34,211,238,0.15)',
            padding: '1px 6px', cursor: 'pointer', letterSpacing: 1, marginLeft: 8,
            borderRadius: 2,
          }}>
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 3, padding: '4px 8px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(34,211,238,0.05)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            style={{
              fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '3px 7px', cursor: 'pointer', borderRadius: 2,
              border: filter === s ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(255,255,255,0.08)',
              background: filter === s ? 'rgba(34,211,238,0.08)' : 'transparent',
              color: filter === s ? 'rgba(34,211,238,0.8)' : 'rgba(255,255,255,0.3)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div style={{
        padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3,
        overflowY: 'auto', position: 'relative', zIndex: 2,
        height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease',
      }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            style={{ display: 'flex', gap: 8, fontSize: 10, lineHeight: 1.4 }}
          >
            <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>[{log.time}]</span>
            <span style={{ color: typeColor(log.type), flexShrink: 0 }}>{typeGlyph(log.type)}</span>
            <span style={{ color: typeColor(log.type), fontWeight: 700, flexShrink: 0 }}>{log.service}:</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
