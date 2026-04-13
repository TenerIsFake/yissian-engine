import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * FileCabinet — NOIR-mode storage diagram (Server Storage + Media Storage).
 * Front view of a filing cabinet with 4 drawers.
 * Drawers slide open from bottom up as storage fills.
 * File folder tabs visible in open drawers. Cabinet bulges at >90%.
 *
 * Props: label, level, online, details, catKey, size
 */
const FileCabinet = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  const openDrawers = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;
  const isOverstuffed = level > 90;

  // Cabinet geometry
  const cabX = 22, cabY = 10, cabW = 56, cabH = 72;
  const drawerH = cabH / 4;
  const drawerGap = 1.5;
  const handleW = 10, handleH = 2.5;

  // Bulge effect at >90%
  const bulge = isOverstuffed ? (level - 90) / 10 * 2.5 : 0;

  const drawers = Array.from({ length: 4 }, (_, i) => {
    // Drawers fill from bottom up: index 3 = bottom
    const drawerIndex = 3 - i; // 0=top, 3=bottom
    const isOpen = drawerIndex < openDrawers;
    const slideOut = isOpen ? 4 + act * 3 : 0;
    const y = cabY + i * drawerH + drawerGap * i;

    return { index: i, drawerIndex, isOpen, slideOut, y };
  });

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 120, background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${cat.border}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            FILE_CABINET ◆ EVIDENCE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {openDrawers}/4 open {isOverstuffed ? '· OVERSTUFFED' : ''}
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color: cat.text }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? cat.border : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(0)}% — ${openDrawers}/4 drawers open — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Cabinet body outline with potential bulge */}
        <rect
          x={cabX - bulge} y={cabY}
          width={cabW + bulge * 2} height={cabH}
          rx={1.5}
          fill={cat.border} fillOpacity={0.03}
          stroke={cat.border} strokeWidth="1.2" opacity={0.3}
        />

        {/* Lock on top drawer */}
        <circle cx={cabX + cabW / 2} cy={cabY + 4} r={2}
          fill="none" stroke={cat.border} strokeWidth="0.8" opacity={0.25} />
        <rect x={cabX + cabW / 2 - 0.5} y={cabY + 3} width={1} height={2.5}
          fill={cat.border} opacity={0.2} />

        {/* Drawers */}
        {drawers.map(({ index, drawerIndex, isOpen, slideOut, y }) => {
          const drawerBody = (
            <g key={`drawer-${index}`}>
              {/* Drawer face */}
              <rect
                x={cabX + 2 - (isOverstuffed && isOpen ? bulge * 0.5 : 0)}
                y={y + 1}
                width={cabW - 4 + (isOverstuffed && isOpen ? bulge : 0)}
                height={drawerH - drawerGap - 1}
                rx={1}
                fill={isOpen ? cat.border : 'transparent'}
                fillOpacity={isOpen ? 0.08 : 0}
                stroke={cat.border}
                strokeWidth={isOpen ? 0.8 : 0.5}
                opacity={isOpen ? 0.4 : 0.15}
              />

              {/* Handle */}
              <rect
                x={cabX + cabW / 2 - handleW / 2}
                y={y + drawerH / 2 - handleH / 2}
                width={handleW}
                height={handleH}
                rx={1}
                fill="none"
                stroke={cat.border}
                strokeWidth={0.8}
                opacity={isOpen ? 0.5 : 0.2}
              />

              {/* File folder tabs visible in open drawers */}
              {isOpen && (
                <>
                  {[0.2, 0.45, 0.7].map((frac, fi) => {
                    const tabX = cabX + 4 + frac * (cabW - 12);
                    const tabW = 6;
                    const tabH = 3;
                    return (
                      <g key={`tab-${index}-${fi}`}>
                        {/* Folder tab */}
                        <rect x={tabX} y={y + 2} width={tabW} height={tabH} rx={0.5}
                          fill={cat.border} opacity={0.15 + fi * 0.05} />
                        {/* Folder body line */}
                        <line x1={tabX} y1={y + 2 + tabH} x2={tabX + tabW} y2={y + 2 + tabH}
                          stroke={cat.border} strokeWidth="0.4" opacity={0.1} />
                      </g>
                    );
                  })}
                  {/* Paper edges peeking out if overstuffed */}
                  {isOverstuffed && (
                    <>
                      <line x1={cabX + cabW - 1} y1={y + 4} x2={cabX + cabW + bulge + 1} y2={y + 3}
                        stroke={cat.border} strokeWidth="0.4" opacity={0.15} />
                      <line x1={cabX + cabW - 1} y1={y + 8} x2={cabX + cabW + bulge} y2={y + 7.5}
                        stroke={cat.border} strokeWidth="0.3" opacity={0.1} />
                    </>
                  )}
                </>
              )}

              {/* Slide-out shadow (open drawers protrude slightly) */}
              {isOpen && slideOut > 0 && (
                <rect
                  x={cabX + 2}
                  y={y + drawerH - drawerGap}
                  width={cabW - 4}
                  height={slideOut}
                  rx={0.5}
                  fill={cat.border}
                  opacity={0.04}
                />
              )}
            </g>
          );

          // Animate open drawers sliding
          if (isOpen && !prefersReducedMotion && online) {
            return (
              <motion.g key={`drawer-anim-${index}`}
                initial={{ x: 0 }}
                animate={{ x: [0, slideOut, slideOut * 0.7] }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: drawerIndex * 0.2 }}
              >
                {drawerBody}
              </motion.g>
            );
          }
          return drawerBody;
        })}

        {/* Cabinet feet */}
        <rect x={cabX + 2} y={cabY + cabH} width={4} height={3} rx={0.5}
          fill={cat.border} opacity={0.15} />
        <rect x={cabX + cabW - 6} y={cabY + cabH} width={4} height={3} rx={0.5}
          fill={cat.border} opacity={0.15} />

        {/* Percentage readout */}
        <text x={50} y={93} textAnchor="middle" fill={cat.border}
          fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={88} cy={93} r={2.5}
          fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default FileCabinet;
