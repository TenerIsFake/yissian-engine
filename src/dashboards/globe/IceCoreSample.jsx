import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * IceCoreSample — GLOBE-mode storage diagram.
 * Vertical ice core cylinder with annual layers. Layers fill from bottom up
 * proportional to storage. Different density/color per layer (air bubbles
 * visible in transparent ice). Core breaks at >90% (stress fracture).
 * Depth markers on the side.
 *
 * Props match diagram interface:
 *   label, level, online, details, catKey, size
 */
const IceCoreSample = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();
  const cat = activeCATRef.current[catKey] ?? activeCATRef.current.TRANSITION;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  const isCritical = level > 90;

  // Core cylinder geometry (within 100x100 viewBox)
  const coreX = 30, coreW = 40;
  const coreTop = 10, coreBottom = 85;
  const coreH = coreBottom - coreTop;
  const fillH = act * coreH;
  const fillTop = coreBottom - fillH;

  // Layer bands (annual strata) — 8 layers with varying opacity/density
  const LAYERS = Array.from({ length: 8 }, (_, i) => {
    const layerH = coreH / 8;
    const y = coreTop + i * layerH;
    const density = 0.5 + (i / 8) * 0.5; // deeper = denser
    const isFilled = y + layerH >= fillTop;
    return { y, h: layerH, density, isFilled, idx: i };
  });

  // Air bubble positions (scattered in ice)
  const BUBBLES = [
    { cx: 40, cy: 25, r: 1.2 }, { cx: 55, cy: 30, r: 0.8 },
    { cx: 45, cy: 40, r: 1.0 }, { cx: 58, cy: 45, r: 0.7 },
    { cx: 38, cy: 55, r: 1.1 }, { cx: 52, cy: 60, r: 0.9 },
    { cx: 42, cy: 70, r: 0.6 }, { cx: 60, cy: 75, r: 1.0 },
  ];

  // Stress fracture path (only at >90%)
  const fracturePath = 'M 30,35 L 38,37 L 33,42 L 40,45 L 35,50 L 42,52 L 37,56 L 44,58 L 38,62 L 70,62 L 64,58 L 58,56 L 65,52 L 60,50 L 67,45 L 62,42 L 68,37 L 70,35';

  // Depth markers every 25%
  const DEPTH_MARKS = [25, 50, 75, 100].map(pct => ({
    pct,
    y: coreTop + (pct / 100) * coreH,
    label: `${(pct / 100 * 300).toFixed(0)}m`, // depth in meters metaphor
  }));

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
            ICE_CORE ◆ STRATIGRAPHY
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {isCritical ? 'STRESS FRACTURE' : level > 75 ? 'HIGH DENSITY' : 'STABLE CORE'}
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
        role="img" aria-label={`${label}: ${level.toFixed(0)}% storage, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <rect x={coreX} y={coreTop} width={coreW} height={coreH} rx="3" />
          </clipPath>
          <linearGradient id={`${gradId}-ice`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cat.border} stopOpacity={0.15} />
            <stop offset="40%" stopColor={cat.border} stopOpacity={0.25} />
            <stop offset="100%" stopColor={cat.border} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* Core cylinder outline */}
        <rect x={coreX} y={coreTop} width={coreW} height={coreH} rx="3"
          fill={cat.border} fillOpacity={0.02}
          stroke={cat.border} strokeWidth="0.8" opacity={0.3} />

        {/* Clipped fill area */}
        <g clipPath={`url(#${clipId})`}>
          {/* Layer bands */}
          {LAYERS.map((layer) => {
            const layerOp = layer.isFilled
              ? 0.08 + layer.density * 0.15
              : 0.01;
            return (
              <React.Fragment key={`layer-${layer.idx}`}>
                <rect x={coreX} y={layer.y} width={coreW} height={layer.h}
                  fill={`url(#${gradId}-ice)`} opacity={layerOp} />
                {/* Layer boundary line */}
                <line x1={coreX + 2} y1={layer.y} x2={coreX + coreW - 2} y2={layer.y}
                  stroke={cat.border} strokeWidth="0.3"
                  opacity={layer.isFilled ? 0.2 : 0.04}
                  strokeDasharray="2 4" />
              </React.Fragment>
            );
          })}

          {/* Ice fill (solid from bottom) */}
          {fillH > 0 && (
            isCritical && !prefersReducedMotion && online ? (
              <motion.rect x={coreX + 1} y={fillTop} width={coreW - 2} height={fillH}
                fill={cat.border} opacity={0.12}
                animate={{ opacity: [0.12, 0.06, 0.12] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect x={coreX + 1} y={fillTop} width={coreW - 2} height={fillH}
                fill={cat.border} opacity={0.12} />
            )
          )}

          {/* Air bubbles (only in filled portion) */}
          {BUBBLES.map((b, i) => {
            if (b.cy < fillTop) return null;
            return (
              <circle key={`bubble-${i}`} cx={b.cx} cy={b.cy} r={b.r}
                fill="none" stroke={cat.border}
                strokeWidth="0.3" opacity={0.2 + (1 - b.r) * 0.15} />
            );
          })}

          {/* Stress fracture crack at >90% */}
          {isCritical && online && (
            <path d={fracturePath}
              fill="none" stroke={cat.text}
              strokeWidth="0.8" opacity={0.5}
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 2px ${cat.text})` }}
            />
          )}
        </g>

        {/* Depth markers (left side) */}
        {DEPTH_MARKS.map((dm) => (
          <g key={`dm-${dm.pct}`}>
            <line x1={coreX - 4} y1={dm.y} x2={coreX} y2={dm.y}
              stroke={cat.border} strokeWidth="0.5" opacity={0.25} />
            <text x={coreX - 6} y={dm.y + 1.5} textAnchor="end"
              fill={cat.text} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
              {dm.label}
            </text>
          </g>
        ))}

        {/* Percentage label on right side */}
        <text x={coreX + coreW + 5} y={fillTop + fillH / 2 + 2} textAnchor="start"
          fill={cat.border} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.7}>
          {level.toFixed(0)}%
        </text>

        {/* Top cap (ellipse for 3D cylinder effect) */}
        <ellipse cx={coreX + coreW / 2} cy={coreTop} rx={coreW / 2} ry="2.5"
          fill={cat.border} fillOpacity={0.04}
          stroke={cat.border} strokeWidth="0.5" opacity={0.25} />

        {/* Bottom cap */}
        <ellipse cx={coreX + coreW / 2} cy={coreBottom} rx={coreW / 2} ry="2.5"
          fill={cat.border} fillOpacity={0.03}
          stroke={cat.border} strokeWidth="0.5" opacity={0.2} />

        {/* Status label */}
        <text x={50} y={96} textAnchor="middle" fill={cat.border} fontSize="4" fontFamily={MONO} opacity={0.4} letterSpacing="0.08em">
          {isCritical ? 'FRACTURE' : level > 75 ? 'DENSE' : 'STABLE'}
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

export default IceCoreSample;
