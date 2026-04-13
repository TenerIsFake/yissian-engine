import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// ─────────────────────────────────────────────
// JABLONSKI DIAGRAM (bandwidth metrics — excitation/emission)
// ─────────────────────────────────────────────
const JablonskiDiagram = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isEmission = variant === 'emission';
  const act = level / 100;
  const arrowOpacity = Math.max(0.2, act);
  const arrowGlow = `drop-shadow(0 0 ${2 + act * 6}px ${cat.border})`;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

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
          minWidth: 130, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${cat.border}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            {jablonskiLabel || (isEmission ? 'JABLONSKI ◆ EMISSION' : 'JABLONSKI ◆ EXCITATION')}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        {/* Energy level lines */}
        {/* S₂ */}
        <line x1="10" y1="16" x2="90" y2="16" stroke={cat.border} strokeWidth="1.2" opacity="0.65" />
        <line x1="14" y1="20" x2="86" y2="20" stroke={cat.border} strokeWidth="0.5" opacity="0.2" />
        <line x1="14" y1="24" x2="86" y2="24" stroke={cat.border} strokeWidth="0.5" opacity="0.12" />
        <text x="3" y="18" fill={cat.text} fontSize="5.5" fontFamily={MONO} opacity="0.55">S₂</text>
        {/* S₁ */}
        <line x1="10" y1="46" x2="72" y2="46" stroke={cat.border} strokeWidth="1.2" opacity="0.65" />
        <line x1="14" y1="50" x2="68" y2="50" stroke={cat.border} strokeWidth="0.5" opacity="0.2" />
        <line x1="14" y1="54" x2="68" y2="54" stroke={cat.border} strokeWidth="0.5" opacity="0.12" />
        <text x="3" y="48" fill={cat.text} fontSize="5.5" fontFamily={MONO} opacity="0.55">S₁</text>
        {/* T₁ (triplet — dashed, slightly below S₁, right side) */}
        <line x1="68" y1="54" x2="90" y2="54" stroke={cat.border} strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
        <text x="91" y="56" fill={cat.text} fontSize="5" fontFamily={MONO} opacity="0.3">T₁</text>
        {/* S₀ ground — boldest */}
        <line x1="10" y1="80" x2="90" y2="80" stroke={cat.border} strokeWidth="2" opacity="0.85" />
        <line x1="14" y1="84" x2="86" y2="84" stroke={cat.border} strokeWidth="0.5" opacity="0.18" />
        <text x="3" y="82" fill={cat.text} fontSize="5.5" fontFamily={MONO} opacity="0.55">S₀</text>

        {isEmission ? (
          <>
            {/* Internal conversion S₂→S₁ */}
            <path d="M 36 16 C 32 26 40 36 36 46"
              stroke="rgba(253,150,68,0.55)" strokeWidth="1.2" fill="none"
              strokeDasharray="2,2" opacity={0.25 + act * 0.45} />
            <polygon points="33,43 39,43 36,47" fill="rgba(253,150,68,0.55)" opacity={0.25 + act * 0.45} />

            {/* Fluorescence S₁ → S₀ */}
            {prefersReducedMotion ? (
              <line x1="58" y1="46" x2="58" y2="80" stroke={cat.border} strokeWidth="2.5" opacity={arrowOpacity} />
            ) : (
              <motion.path
                d="M 58 46 C 53 55 63 62 58 70 C 53 76 61 78 58 80"
                stroke={cat.border} strokeWidth="2.2" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: arrowOpacity }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ filter: arrowGlow }}
              />
            )}
            <polygon points="54,77 62,77 58,82" fill={cat.border} opacity={arrowOpacity} style={{ filter: arrowGlow }} />

            {/* ISC S₁ → T₁ */}
            <path d="M 70 46 L 80 54" stroke={cat.border} strokeWidth="0.8" strokeDasharray="2,2" fill="none" opacity={0.18 + act * 0.28} />

            {/* Phosphorescence T₁ → S₀ */}
            {act > 0.3 && (
              <path d="M 79 54 C 76 63 82 70 79 80"
                stroke={cat.border} strokeWidth="1" fill="none"
                strokeDasharray="3,2" opacity={Math.min((act - 0.3) * 0.8, 0.55)}
                style={{ filter: arrowGlow }} />
            )}
            <polygon points="76,77 82,77 79,82" fill={cat.border} opacity={act > 0.3 ? Math.min((act - 0.3) * 0.7, 0.45) : 0} />
          </>
        ) : (
          <>
            {/* Primary absorption S₀ → S₁ */}
            {prefersReducedMotion ? (
              <line x1="40" y1="80" x2="40" y2="46" stroke={cat.border} strokeWidth="2.5" opacity={arrowOpacity} />
            ) : (
              <motion.line
                x1="40" y1="80" x2="40" y2="46"
                stroke={cat.border} strokeWidth="2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: arrowOpacity }}
                transition={{ duration: 0.8 }}
                style={{ filter: arrowGlow }}
              />
            )}
            <polygon points="36,50 44,50 40,46" fill={cat.border} opacity={arrowOpacity} style={{ filter: arrowGlow }} />

            {/* Higher absorption S₀ → S₂ (visible when level > 35%) */}
            {act > 0.35 && (
              <>
                {prefersReducedMotion ? (
                  <line x1="24" y1="80" x2="24" y2="16" stroke={cat.border} strokeWidth="1.5" opacity={Math.min((act - 0.35) * 1.3, 0.75)} />
                ) : (
                  <motion.line
                    x1="24" y1="80" x2="24" y2="16"
                    stroke={cat.border} strokeWidth="1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: Math.min((act - 0.35) * 1.3, 0.75) }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ filter: arrowGlow }}
                  />
                )}
                <polygon points="20,20 28,20 24,16" fill={cat.border} opacity={Math.min((act - 0.35) * 1.2, 0.65)} style={{ filter: arrowGlow }} />
              </>
            )}
          </>
        )}

        {/* Online dot + level readout */}
        <circle cx="50" cy="93" r="2.5" fill={online ? cat.border : '#374151'} opacity="0.85"
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
        <text x="50" y="100" textAnchor="middle" fill={cat.text} fontSize="5.5" fontFamily={MONO} opacity="0.75">
          {level.toFixed(0)}%
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default JablonskiDiagram;
