import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * GeologicalStrata — PLANET-mode server storage diagram (replaces OrbitalDiagram).
 * Side-view geological column — horizontal strata layers stacking from bedrock up.
 * Each layer fills as storage increases. Fossil markers in layers.
 * Critical: seismic fault line, strata displacement.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const GeologicalStrata = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
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

  const color = online ? cat : '#6b7280';
  const showFault = level > 85 && online;

  const tierLabel = level < 25 ? 'Shallow' : level < 50 ? 'Mid' : level < 75 ? 'Deep' : 'Bedrock';

  const STRATA = [
    { y: 72, h: 10, label: 'BEDROCK',    opBase: 0.5,  pattern: 'solid' },
    { y: 60, h: 12, label: 'IGNEOUS',    opBase: 0.38, pattern: 'crystal' },
    { y: 48, h: 12, label: 'METAMORPHIC',opBase: 0.26, pattern: 'wavy' },
    { y: 36, h: 12, label: 'SEDIMENT',   opBase: 0.16, pattern: 'dots' },
    { y: 26, h: 10, label: 'TOPSOIL',    opBase: 0.1,  pattern: 'roots' },
  ];

  const filledLayers = Math.ceil(act * STRATA.length);

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
            STRATA ◆ COLUMN
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {filledLayers}/{STRATA.length} layers · {tierLabel}
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
          {STRATA.map((layer, i) => (
            <linearGradient key={i} id={`${gradId}-strata-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={i < filledLayers ? layer.opBase * 0.7 : 0.01} />
              <stop offset="50%" stopColor={color} stopOpacity={i < filledLayers ? layer.opBase + act * 0.15 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={i < filledLayers ? layer.opBase * 0.7 : 0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* Column outline */}
        <rect x={16} y={24} width={58} height={60} rx={1}
          fill="none" stroke={color} strokeWidth="0.6" opacity={0.15} />

        {/* Strata layers */}
        {STRATA.map((layer, i) => {
          const isActive = i < filledLayers;
          const baseOp = isActive ? layer.opBase + act * 0.1 : 0.02;

          return (
            <React.Fragment key={`strata-${i}`}>
              {/* Layer fill */}
              {prefersReducedMotion || !isActive ? (
                <rect x={17} y={layer.y} width={56} height={layer.h}
                  fill={`url(#${gradId}-strata-${i})`} opacity={baseOp} />
              ) : (
                <motion.rect x={17} y={layer.y} width={56} height={layer.h}
                  fill={`url(#${gradId}-strata-${i})`}
                  animate={{ opacity: [baseOp, baseOp * 1.2, baseOp] }}
                  transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              )}

              {/* Layer boundary line */}
              <line x1={16} y1={layer.y} x2={74} y2={layer.y}
                stroke={color} strokeWidth={isActive ? 0.5 : 0.2}
                opacity={isActive ? 0.25 : 0.06} />

              {/* Pattern textures within layers */}
              {isActive && layer.pattern === 'crystal' && (
                <g opacity={0.08}>
                  <path d={`M 25,${layer.y + 3} L 28,${layer.y + 6} L 25,${layer.y + 9}`} stroke={color} strokeWidth="0.3" fill="none" />
                  <path d={`M 45,${layer.y + 2} L 48,${layer.y + 5} L 45,${layer.y + 8}`} stroke={color} strokeWidth="0.3" fill="none" />
                  <path d={`M 60,${layer.y + 4} L 63,${layer.y + 7} L 60,${layer.y + 10}`} stroke={color} strokeWidth="0.3" fill="none" />
                </g>
              )}
              {isActive && layer.pattern === 'wavy' && (
                <g opacity={0.06}>
                  <path d={`M 18,${layer.y + 4} Q 30,${layer.y + 2} 45,${layer.y + 4} Q 58,${layer.y + 6} 73,${layer.y + 4}`} stroke={color} strokeWidth="0.3" fill="none" />
                  <path d={`M 18,${layer.y + 8} Q 30,${layer.y + 6} 45,${layer.y + 8} Q 58,${layer.y + 10} 73,${layer.y + 8}`} stroke={color} strokeWidth="0.3" fill="none" />
                </g>
              )}
              {isActive && layer.pattern === 'dots' && (
                <g opacity={0.08}>
                  {[24, 35, 46, 57, 65].map((dx, di) => (
                    <circle key={`dot-${di}`} cx={dx} cy={layer.y + 5 + (di % 2) * 3} r={0.6} fill={color} />
                  ))}
                </g>
              )}
              {isActive && layer.pattern === 'roots' && (
                <g opacity={0.06}>
                  <path d={`M 30,${layer.y} L 30,${layer.y + 5} L 28,${layer.y + 7}`} stroke={color} strokeWidth="0.3" fill="none" />
                  <path d={`M 50,${layer.y} L 50,${layer.y + 4} L 52,${layer.y + 6}`} stroke={color} strokeWidth="0.3" fill="none" />
                  <path d={`M 65,${layer.y} L 65,${layer.y + 6} L 63,${layer.y + 8}`} stroke={color} strokeWidth="0.3" fill="none" />
                </g>
              )}

              {/* Fossil markers (small symbols in sedimentary/metamorphic layers) */}
              {isActive && (i === 2 || i === 3) && (
                <g opacity={0.12}>
                  <circle cx={38} cy={layer.y + layer.h / 2} r={1.5}
                    fill="none" stroke={color} strokeWidth="0.4" />
                  <path d={`M 55,${layer.y + layer.h / 2 - 1.5} Q 57,${layer.y + layer.h / 2} 55,${layer.y + layer.h / 2 + 1.5}`}
                    stroke={color} strokeWidth="0.3" fill="none" />
                </g>
              )}
            </React.Fragment>
          );
        })}

        {/* Layer labels (right side) */}
        {STRATA.map((layer, i) => (
          i < filledLayers && (
            <text key={`slbl-${i}`} x={77} y={layer.y + layer.h / 2 + 1.5}
              fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.35}>
              {layer.label}
            </text>
          )
        ))}

        {/* Depth scale (left side) */}
        {STRATA.map((layer, i) => (
          i < filledLayers && (
            <text key={`depth-${i}`} x={14} y={layer.y + layer.h / 2 + 1.5}
              textAnchor="end" fill={color} fontSize="2.5" fontFamily={MONO} opacity={0.2}>
              {(i + 1) * 20}m
            </text>
          )
        ))}

        {/* Surface line */}
        <line x1={14} y1={26} x2={76} y2={26}
          stroke={color} strokeWidth="0.6" opacity={0.2} />
        <text x={45} y={22} textAnchor="middle" fill={color}
          fontSize="3" fontFamily={MONO} opacity={0.25}>
          SURFACE
        </text>

        {/* Seismic fault at critical */}
        {showFault && (() => {
          const faultScale = (level - 85) / 15;
          const fault = (
            <g>
              {/* Diagonal fault line cutting through strata */}
              <path d="M 32,28 L 38,45 L 35,60 L 40,80"
                stroke={color} strokeWidth="1" fill="none"
                opacity={0.3 + faultScale * 0.4}
                strokeDasharray="none" />
              {/* Displacement — right side shifted down */}
              <line x1={38} y1={45} x2={42} y2={48}
                stroke={color} strokeWidth="0.6" opacity={0.2 + faultScale * 0.3} />
              <line x1={35} y1={60} x2={39} y2={63}
                stroke={color} strokeWidth="0.6" opacity={0.2 + faultScale * 0.3} />
              {/* Seismic waves */}
              <path d={`M 14,84 Q 25,${82 - faultScale * 3} 45,84 Q 65,${86 + faultScale * 2} 86,84`}
                stroke={color} strokeWidth="0.4" fill="none"
                opacity={0.15 + faultScale * 0.2} />
            </g>
          );
          return prefersReducedMotion ? fault : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {fault}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {filledLayers}/{STRATA.length} Layers
      </div>
    </div>
  );
};

export default GeologicalStrata;
