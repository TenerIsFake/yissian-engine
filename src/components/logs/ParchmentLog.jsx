import React from 'react';
import { motion } from 'framer-motion';

// Parchment family — ARCANE, DINO, NOIR
// Aged paper feel, serif accents, ink-wash borders, wax seal decorations

const typeColor = (t) => {
  if (t === 'success') return '#8B9F6B';
  if (t === 'error')   return '#A04040';
  if (t === 'warn')    return '#C4A040';
  return '#8090A0';
};
const typeGlyph = (t) => {
  if (t === 'success') return '✦';
  if (t === 'error')   return '✝';
  if (t === 'warn')    return '⚑';
  return '•';
};

export default function ParchmentLog({ logs, title, filter, setFilter, expanded, setExpanded, services, visibleEntries }) {
  return (
    <div style={{
      borderRadius: 4,
      border: '1px solid rgba(180,150,100,0.15)',
      background: 'linear-gradient(180deg, rgba(30,25,18,0.85) 0%, rgba(20,16,10,0.9) 100%)',
      overflow: 'hidden',
      fontFamily: 'monospace',
    }}>
      {/* Header — parchment title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        borderBottom: '1px solid rgba(180,150,100,0.1)',
        background: 'rgba(180,150,100,0.04)',
        fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(200,170,120,0.5)',
      }}>
        <span style={{ fontSize: 12, opacity: 0.4 }}>❦</span>
        <span style={{ fontStyle: 'italic' }}>{title ?? 'CHRONICLE ◆ Parchment_Ledger'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 7, color: 'rgba(180,150,100,0.25)' }}>· · ·</span>
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          style={{
            fontFamily: 'monospace', fontSize: 8, color: 'rgba(200,170,120,0.4)',
            background: 'transparent', border: '1px solid rgba(180,150,100,0.15)',
            padding: '2px 8px', cursor: 'pointer', letterSpacing: 1,
            borderRadius: 2,
          }}>
          {expanded ? '▲ FOLD' : '▼ UNFOLD'}
        </button>
      </div>

      {/* Filter tabs — parchment buttons */}
      <div style={{ display: 'flex', gap: 3, padding: '4px 10px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(180,150,100,0.06)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            style={{
              fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '3px 7px', cursor: 'pointer', borderRadius: 2,
              border: filter === s ? '1px solid rgba(180,150,100,0.25)' : '1px solid rgba(255,255,255,0.06)',
              background: filter === s ? 'rgba(180,150,100,0.08)' : 'transparent',
              color: filter === s ? 'rgba(200,170,120,0.7)' : 'rgba(255,255,255,0.25)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div style={{
        padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4,
        overflowY: 'auto',
        height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease',
      }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            key={log.id}
            style={{
              display: 'flex', gap: 8, fontSize: 10, lineHeight: 1.5,
              borderBottom: '1px solid rgba(180,150,100,0.04)',
              paddingBottom: 3,
            }}
          >
            <span style={{ color: 'rgba(180,150,100,0.22)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{log.time}</span>
            <span style={{ color: typeColor(log.type), flexShrink: 0 }}>{typeGlyph(log.type)}</span>
            <span style={{ color: typeColor(log.type), fontWeight: 700, flexShrink: 0 }}>{log.service}</span>
            <span style={{ color: 'rgba(200,185,160,0.55)' }}>— {log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
