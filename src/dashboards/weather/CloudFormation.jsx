import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * CloudFormation — WEATHER-mode media storage diagram (replaces OrbitalDiagram).
 * Cloud silhouette that densifies with fill level.
 * Low = wispy cirrus outline. Medium = puffy cumulus. High = dark cumulonimbus.
 * Critical (>85%): lightning bolt strokes inside cloud.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const CloudFormation = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCritical = level > 85;
  // Cloud fill opacity increases with level
  const cloudFill = level <= 30 ? 0.04 : level <= 60 ? 0.08 + act * 0.12 : 0.15 + act * 0.25;
  const cloudStroke = level <= 30 ? 0.2 : level <= 60 ? 0.35 : 0.5 + act * 0.3;

  // Cloud path — gets more complex/taller with level
  const baseY = 65;
  const cloudTop = level <= 30 ? 45 : level <= 60 ? 38 : 28;
  // Cumulus cloud path
  const cloudPath = level <= 30
    ? `M 20,${baseY} Q 25,${cloudTop + 10} 35,${cloudTop + 5} Q 45,${cloudTop - 2} 55,${cloudTop + 3} Q 65,${cloudTop + 8} 75,${cloudTop + 12} Q 82,${baseY - 5} 80,${baseY} Z`
    : level <= 60
      ? `M 18,${baseY} Q 22,${cloudTop + 8} 30,${cloudTop + 2} Q 38,${cloudTop - 5} 50,${cloudTop} Q 62,${cloudTop - 5} 70,${cloudTop + 2} Q 78,${cloudTop + 8} 82,${baseY} Z`
      : `M 15,${baseY} Q 18,${cloudTop + 5} 28,${cloudTop - 2} Q 35,${cloudTop - 10} 42,${cloudTop - 5} Q 50,${cloudTop - 12} 58,${cloudTop - 5} Q 65,${cloudTop - 10} 72,${cloudTop - 2} Q 82,${cloudTop + 5} 85,${baseY} Z`;

  // Cloud type label
  const cloudType = level <= 30 ? 'Cirrus' : level <= 60 ? 'Cumulus' : level <= 85 ? 'Nimbus' : 'Cb';

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
            CLOUD_COVER ◆ {cloudType.toUpperCase()}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
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
        role="img" aria-label={`${label}: ${level.toFixed(0)}% load, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cat.border} stopOpacity={cloudFill * 0.6} />
            <stop offset="100%" stopColor={cat.border} stopOpacity={cloudFill} />
          </linearGradient>
        </defs>

        {/* Cloud fill */}
        {isCritical && !prefersReducedMotion ? (
          <motion.path d={cloudPath} fill={`url(#${gradId})`}
            stroke={cat.border} strokeWidth="1" strokeOpacity={cloudStroke}
            animate={{ opacity: [cloudFill, cloudFill * 0.7, cloudFill] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <path d={cloudPath} fill={`url(#${gradId})`}
            stroke={cat.border} strokeWidth={level <= 30 ? 0.6 : 1}
            strokeOpacity={cloudStroke}
            strokeDasharray={level <= 30 ? '3 4' : 'none'} />
        )}

        {/* Internal cloud texture lines (wisps) */}
        {level > 30 && (
          <g opacity={0.1 + act * 0.15}>
            <path d={`M 30,${baseY - 10} Q 45,${baseY - 15} 60,${baseY - 10}`}
              stroke={cat.border} strokeWidth="0.5" fill="none" />
            {level > 60 && (
              <path d={`M 35,${baseY - 20} Q 50,${baseY - 25} 65,${baseY - 20}`}
                stroke={cat.border} strokeWidth="0.4" fill="none" />
            )}
          </g>
        )}

        {/* Lightning bolts at critical */}
        {isCritical && online && (() => {
          const bolts = (
            <g>
              <path d="M 40,50 L 36,60 L 41,58 L 37,72"
                stroke={cat.border} strokeWidth="1.2" fill="none"
                opacity={0.7}
                style={{ filter: `drop-shadow(0 0 3px ${cat.border})` }} />
              <path d="M 58,45 L 62,56 L 57,54 L 61,66"
                stroke={cat.border} strokeWidth="1" fill="none"
                opacity={0.5}
                style={{ filter: `drop-shadow(0 0 2px ${cat.border})` }} />
            </g>
          );
          return prefersReducedMotion ? bolts : (
            <motion.g
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {bolts}
            </motion.g>
          );
        })()}

        {/* Rain drops below cloud at high level */}
        {level > 60 && online && (
          <g opacity={0.15 + (level - 60) / 100 * 0.4}>
            {[30, 42, 55, 68].map((rx, i) => (
              prefersReducedMotion ? (
                <circle key={`drop-${i}`} cx={rx} cy={baseY + 8 + i * 3} r={0.8} fill={cat.border} />
              ) : (
                <motion.circle key={`drop-${i}`} cx={rx} r={0.8} fill={cat.border}
                  animate={{ cy: [baseY + 2, baseY + 20], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeIn', delay: i * 0.3 }}
                />
              )
            ))}
          </g>
        )}

        {/* Percentage readout */}
        <text x={50} y={92} textAnchor="middle" fill={cat.border} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Cloud type label */}
        <text x={50} y={12} textAnchor="middle" fill={cat.border} fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {cloudType.toUpperCase()}
        </text>

        {/* Online dot */}
        <circle cx={50} cy={98} r={2} fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default CloudFormation;
