import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import VinylCard from './VinylCard.jsx';
import { VINYL_OVERLAY } from './vinylConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// LP spine angles — crate isometric view
const SLEEVE_W = 84;
const SLEEVE_GAP = -22; // overlap amount
const ROWS_PER_CRATE = 2;

const SPIN_STYLE = `
  @keyframes vinyl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const VinylGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  // Group records by genre for crate dividers
  const byGenre = useMemo(() => {
    const groups = {};
    elementRegistry.forEach(el => {
      const genre = VINYL_OVERLAY[el.id]?.genre ?? 'Misc';
      if (!groups[genre]) groups[genre] = [];
      groups[genre].push(el);
    });
    return groups;
  }, [elementRegistry]);

  // T2-04: `rows` useMemo and `totalY` removed — both were dead code.
  // JSX renders directly from byGenre via Object.entries (see below).
  // `rows` split genres into flat row arrays but was never consumed by any JSX.
  // `totalY` was assigned 16 and never read or incremented after removal of an
  // earlier absolute-positioning layout that used it.

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <style>{SPIN_STYLE}</style>

      {/* Crate header */}
      <div style={{ width: CW, margin: '0 auto', paddingBottom: 8 }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Turntable icon */}
          <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, rgba(50,50,50,0.9), rgba(20,20,20,0.9))',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: prefersReducedMotion ? 'none' : 'vinyl-spin 2s linear infinite',
            }} />
            {[10, 16, 22].map(r => (
              <div key={r} style={{
                position: 'absolute', left: '50%', top: '50%',
                width: r, height: r,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '0.5px solid rgba(255,255,255,0.08)',
                pointerEvents: 'none',
              }} />
            ))}
            <div style={{ position: 'absolute', left: '50%', top: '50%',
              width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.6)',
              transform: 'translate(-50%, -50%)' }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.4em' }}>
            ◆ RECORD CRATE — {elementRegistry.length} PRESSINGS ◆
          </span>
        </div>

        {/* Crate rows */}
        <div style={{ padding: '12px 16px' }}>
          {Object.entries(byGenre).map(([genre, items]) => (
            <div key={genre} style={{ marginBottom: 20 }}>
              {/* Genre divider tab */}
              <div style={{ marginBottom: 6, paddingLeft: 4,
                fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.3em', borderLeft: '2px solid rgba(255,255,255,0.15)',
                paddingBottom: 2 }}>
                {genre.toUpperCase()}
              </div>

              {/* LP sleeves in row */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4,
                paddingLeft: 8, flexWrap: 'wrap' }}>
                {items.map((el, i) => {
                  const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
                  const ov = VINYL_OVERLAY[el.id] ?? {};
                  const rpm = ov.rpm ?? '33⅓';
                  const isOnline = stats.online;

                  return (
                    <motion.div
                      key={el.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onElementClick(el)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onElementClick(el); } }}
                      aria-label={el.service ?? el.name}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        transform: `rotate(${-2 + i * 0.5}deg)`,
                        transformOrigin: 'bottom center',
                      }}
                      whileHover={prefersReducedMotion ? {} : { rotate: 0, scale: 1.08, zIndex: 20, y: -8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <VinylCard element={el} stats={stats} onClick={() => {}} />
                      {/* RPM label on spine */}
                      <div style={{ position: 'absolute', bottom: -14, left: 0, right: 0,
                        textAlign: 'center', fontSize: 7, fontFamily: 'monospace',
                        color: isOnline ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
                        letterSpacing: '0.1em' }}>
                        {rpm}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VinylGrid;
