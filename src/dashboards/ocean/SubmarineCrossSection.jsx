import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SubmarineCrossSection — OCEAN-mode CPU diagram (replaces CoordComplex).
 * Side-view cutaway of a submarine hull with 4 compartments that light up
 * progressively with load: Engine Room → Reactor → Sonar Bay → Bridge.
 * Critical: hull stress lines, red emergency lighting, water leak drips.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const SubmarineCrossSection = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 180   // CPU: 200 (ocean blue) → 20 (emergency red-orange)
    : 180 - (level / 100) * 150;  // RAM: 180 (teal) → 30 (amber)
  const color = online ? `hsl(${hue}, 75%, ${40 + (level / 100) * 25}%)` : '#6b7280';

  const act = level / 100;
  const stressThreshold = lowSpin ? 65 : 80;
  const showStress = level > stressThreshold && online;

  const compartmentCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const COMPARTMENTS = [
    { x: 62, w: 18, label: 'ENGINE', opBase: 0.5 },
    { x: 44, w: 18, label: 'REACTOR', opBase: 0.4 },
    { x: 26, w: 18, label: 'SONAR', opBase: 0.3 },
    { x: 10, w: 16, label: 'BRIDGE', opBase: 0.2 },
  ];

  const depthLabel = level < 25 ? 'Surface' : level < 50 ? 'Shallow' : level < 75 ? 'Deep' : 'Crush Depth';

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-1"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 140, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            SUBMARINE ◆ {isCpu ? 'PRESSURE' : 'O2'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Silent Running'} · {depthLabel}
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? color : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          {COMPARTMENTS.map((comp, i) => (
            <linearGradient key={i} id={`${gradId}-comp-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={i < compartmentCount ? comp.opBase + act * 0.3 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={i < compartmentCount ? comp.opBase * 0.5 + act * 0.15 : 0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* Hull outline — elongated oval submarine shape */}
        <path d="M 8,50 Q 8,35 20,32 L 75,32 Q 90,35 92,50 Q 90,65 75,68 L 20,68 Q 8,65 8,50 Z"
          fill="none" stroke={color} strokeWidth="1.2" opacity={0.3} />

        {/* Conning tower / sail */}
        <rect x={38} y={24} width={14} height={10} rx={2}
          fill={color} opacity={0.08} stroke={color} strokeWidth="0.6" />
        <rect x={41} y={22} width={8} height={4} rx={1}
          fill={color} opacity={0.05} stroke={color} strokeWidth="0.4" />

        {/* Compartment dividers (bulkheads) */}
        {[26, 44, 62].map((x, i) => (
          <line key={`bulk-${i}`} x1={x} y1={34} x2={x} y2={66}
            stroke={color} strokeWidth={i < compartmentCount ? 0.8 : 0.3}
            opacity={i < compartmentCount ? 0.35 : 0.1} />
        ))}

        {/* Compartment fills */}
        {COMPARTMENTS.map((comp, i) => {
          const isActive = i < compartmentCount;
          const baseOp = isActive ? comp.opBase + act * 0.15 : 0.02;
          return prefersReducedMotion || !isActive ? (
            <rect key={`comp-${i}`} x={comp.x} y={34} width={comp.w} height={32}
              fill={`url(#${gradId}-comp-${i})`} opacity={baseOp} />
          ) : (
            <motion.rect key={`comp-${i}`} x={comp.x} y={34} width={comp.w} height={32}
              fill={`url(#${gradId}-comp-${i})`}
              animate={{ opacity: [baseOp, baseOp * 1.3, baseOp] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          );
        })}

        {/* Compartment labels */}
        {COMPARTMENTS.map((comp, i) => (
          i < compartmentCount && (
            <text key={`clbl-${i}`} x={comp.x + comp.w / 2} y={50}
              textAnchor="middle" fill={color} fontSize="3" fontFamily={MONO} opacity={0.45}>
              {comp.label}
            </text>
          )
        ))}

        {/* Rivets along hull */}
        {[15, 25, 35, 50, 65, 75, 85].map(x => (
          <React.Fragment key={`rivet-${x}`}>
            <circle cx={x} cy={33} r={0.6} fill={color} opacity={0.15} />
            <circle cx={x} cy={67} r={0.6} fill={color} opacity={0.15} />
          </React.Fragment>
        ))}

        {/* Propeller (stern) */}
        <g opacity={online ? 0.3 + act * 0.2 : 0.08}>
          <circle cx={92} cy={50} r={2} fill={color} opacity={0.4} />
          <line x1={92} y1={42} x2={92} y2={46} stroke={color} strokeWidth="1" strokeLinecap="round" />
          <line x1={92} y1={54} x2={92} y2={58} stroke={color} strokeWidth="1" strokeLinecap="round" />
          <line x1={88} y1={44} x2={90} y2={47} stroke={color} strokeWidth="0.8" strokeLinecap="round" />
          <line x1={88} y1={56} x2={90} y2={53} stroke={color} strokeWidth="0.8" strokeLinecap="round" />
        </g>

        {/* Periscope (top of sail) */}
        <line x1={45} y1={22} x2={45} y2={16} stroke={color} strokeWidth="0.6" opacity={0.25} />
        <rect x={43.5} y={14} width={3} height={2} rx={0.5} fill={color} opacity={0.2} />

        {/* Hull stress lines at critical */}
        {showStress && online && (() => {
          const stressScale = (level - stressThreshold) / (100 - stressThreshold);
          const stress = (
            <g>
              {/* Crack lines */}
              <path d="M 30,33 L 33,36 L 31,39" stroke={color} strokeWidth="0.6"
                fill="none" opacity={0.4 + stressScale * 0.4} />
              <path d="M 55,67 L 58,64 L 56,61" stroke={color} strokeWidth="0.6"
                fill="none" opacity={0.4 + stressScale * 0.4} />
              <path d="M 70,33 L 72,37 L 70,40" stroke={color} strokeWidth="0.5"
                fill="none" opacity={0.3 + stressScale * 0.3} />
              {/* Water leak drips */}
              <circle cx={33} cy={40 + stressScale * 3} r={0.8} fill={color}
                opacity={0.3 + stressScale * 0.4} />
              <circle cx={58} cy={60 - stressScale * 2} r={0.6} fill={color}
                opacity={0.3 + stressScale * 0.3} />
              {/* Red emergency lighting */}
              <rect x={10} y={48} width={80} height={4} rx={1}
                fill={color} opacity={0.05 + stressScale * 0.1} />
            </g>
          );
          return prefersReducedMotion ? stress : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {stress}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{depthLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Silent Running'}
      </div>
    </div>
  );
};

export default SubmarineCrossSection;
