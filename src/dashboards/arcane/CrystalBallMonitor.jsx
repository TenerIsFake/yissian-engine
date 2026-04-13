import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Rune symbols that appear at load thresholds */
const THRESHOLD_RUNES = [
  { pct: 25, glyph: '\u16A0', angle: 0 },    // Fehu
  { pct: 50, glyph: '\u16A2', angle: 90 },   // Thurisaz
  { pct: 75, glyph: '\u16B1', angle: 180 },  // Isa
  { pct: 100, glyph: '\u16B7', angle: 270 }, // Tiwaz
];

/**
 * CrystalBallMonitor -- ARCANE-mode CPU/RAM diagram.
 * A crystal ball (sphere with specular highlight) using SVG.
 * Interior swirling mist intensifies with load. Rune symbols appear at thresholds.
 * Arcane energy crackling (lightning arcs) at >80%.
 *
 * Props: { label, level, online, details, metal, isJahnTeller, lowSpin, size }
 * metal: 'Fe'|'Cu' for CPU hue (200->0 blue->red), 'Co'|'Ni' for RAM hue (160->30 teal->amber)
 */
const CrystalBallMonitor = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200   // CPU: 200 (blue) -> 0 (red)
    : 160 - (level / 100) * 130;  // RAM: 160 (teal) -> 30 (amber)
  const color      = online ? `hsl(${hue}, 85%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 85%, 60%, 0.3)` : 'rgba(107,114,128,0.3)';
  const colorGlow  = online ? `hsla(${hue}, 90%, 55%, 0.5)` : 'transparent';

  const act = level / 100;
  const showLightning = level > 80 && online;
  const activeRunes = THRESHOLD_RUNES.filter(r => level >= r.pct);

  const orbLabel = isCpu ? 'DIVINATION' : 'SCRYING';
  const stateLabel = lowSpin ? 'Channeling' : 'Dormant';

  /* Lightning arc paths (jagged lines inside the sphere) */
  const lightningPaths = [
    'M 35,42 L 40,35 L 38,38 L 44,30 L 42,34 L 48,28',
    'M 65,42 L 60,35 L 62,38 L 56,30 L 58,34 L 52,28',
    'M 42,55 L 46,48 L 44,50 L 50,42',
    'M 58,55 L 54,48 L 56,50 L 50,42',
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-1"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
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
            CRYSTAL_ORB {'\u25C6'} {orbLabel}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {stateLabel} {'\u00B7'} {activeRunes.length}/4 Runes Active
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% \u2014 ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          {/* Sphere gradient */}
          <radialGradient id={`${gradId}-sphere`} cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor={online ? `hsla(${hue}, 60%, 80%, 0.25)` : 'rgba(100,100,110,0.15)'} />
            <stop offset="50%" stopColor={online ? `hsla(${hue}, 70%, 40%, 0.15)` : 'rgba(50,50,60,0.1)'} />
            <stop offset="100%" stopColor="rgba(10,8,20,0.6)" />
          </radialGradient>
          {/* Mist layers */}
          <radialGradient id={`${gradId}-mist1`} cx="45%" cy="50%" r="40%">
            <stop offset="0%" stopColor={color} stopOpacity={0.08 + act * 0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gradId}-mist2`} cx="55%" cy="45%" r="35%">
            <stop offset="0%" stopColor={color} stopOpacity={0.05 + act * 0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gradId}-mist3`} cx="50%" cy="55%" r="30%">
            <stop offset="0%" stopColor={color} stopOpacity={0.03 + act * 0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
          {/* Specular highlight */}
          <radialGradient id={`${gradId}-spec`} cx="35%" cy="30%" r="25%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Pedestal / base */}
        <ellipse cx={50} cy={88} rx={18} ry={4}
          fill={color} opacity={0.08} />
        <path d="M 38,85 Q 50,90 62,85 L 58,80 Q 50,84 42,80 Z"
          fill={color} opacity={0.1} stroke={color} strokeWidth="0.4" />

        {/* Outer glow when online */}
        {online && (
          <circle cx={50} cy={48} r={34}
            fill="none" stroke={colorGlow} strokeWidth={1 + act * 2}
            opacity={0.15 + act * 0.2}
            style={{ filter: `blur(${2 + act * 3}px)` }} />
        )}

        {/* Glass sphere outline */}
        <circle cx={50} cy={48} r={30}
          fill={`url(#${gradId}-sphere)`}
          stroke={online ? colorFaded : 'rgba(107,114,128,0.2)'}
          strokeWidth="1.2" />

        {/* Swirling mist layers */}
        {prefersReducedMotion ? (
          <>
            <circle cx={45} cy={50} r={20} fill={`url(#${gradId}-mist1)`} />
            <circle cx={55} cy={45} r={18} fill={`url(#${gradId}-mist2)`} />
            <circle cx={50} cy={55} r={15} fill={`url(#${gradId}-mist3)`} />
          </>
        ) : (
          <>
            <motion.circle cx={45} cy={50} r={20} fill={`url(#${gradId}-mist1)`}
              animate={{ cx: [42, 48, 42], cy: [48, 52, 48] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.circle cx={55} cy={45} r={18} fill={`url(#${gradId}-mist2)`}
              animate={{ cx: [58, 52, 58], cy: [43, 47, 43] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
            <motion.circle cx={50} cy={55} r={15} fill={`url(#${gradId}-mist3)`}
              animate={{ cx: [47, 53, 47], cy: [53, 57, 53] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
          </>
        )}

        {/* Lightning arcs at >80% */}
        {showLightning && lightningPaths.map((d, i) => {
          const el = (
            <path d={d} stroke={color} strokeWidth="0.8" fill="none"
              opacity={0.5 + act * 0.3}
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
          );
          return prefersReducedMotion ? (
            <g key={`arc-${i}`}>{el}</g>
          ) : (
            <motion.g key={`arc-${i}`}
              animate={{ opacity: [0.2, 0.9, 0.1, 0.7, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
            >
              {el}
            </motion.g>
          );
        })}

        {/* Threshold rune symbols around the sphere */}
        {activeRunes.map(({ glyph, angle, pct }) => {
          const rad = (angle * Math.PI) / 180;
          const rx = 50 + Math.cos(rad) * 36;
          const ry = 48 - Math.sin(rad) * 36;
          const runeEl = (
            <text x={rx} y={ry} textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="7" fontFamily="serif"
              opacity={0.5 + (level - pct) / 100 * 0.5}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
              {glyph}
            </text>
          );
          return prefersReducedMotion ? (
            <g key={`rune-${pct}`}>{runeEl}</g>
          ) : (
            <motion.g key={`rune-${pct}`}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: pct / 100 }}
            >
              {runeEl}
            </motion.g>
          );
        })}

        {/* Specular highlight (glass reflection) */}
        <circle cx={40} cy={38} r={12}
          fill={`url(#${gradId}-spec)`} />

        {/* Percentage readout */}
        <text x={50} y={52} textAnchor="middle" fill={color}
          fontSize="8" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {activeRunes.length}/4 Runes
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {stateLabel} | {orbLabel}
      </div>
    </div>
  );
};

export default CrystalBallMonitor;
