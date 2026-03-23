import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { activeCATRef } from '../themes/ThemeContext.jsx';
import { loadStoredResults, saveResults, runSpeedTestForServer, isStale, SRV1_PATH, SRV2_PATH } from '../speedtest.js';
import { LanPresenceWidget } from './LanPresenceWidget.jsx';
import { CronMonitorWidget } from './CronMonitorWidget.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const defaultStats = () => ({ level: 0, isBoiling: false, online: false, details: [] });

const ELECTRON_CONFIG = {
  Fe: { hs: [4, 2], ls: [6, 0] },
  Co: { hs: [5, 2], ls: [6, 1] },
  Cu: { hs: [6, 3], ls: [6, 3] },
  Ni: { hs: [6, 2], ls: [6, 2] },
};

const METAL_NAMES = { Fe: 'Iron', Co: 'Cobalt', Cu: 'Copper', Ni: 'Nickel' };

// ─────────────────────────────────────────────
// ORBITAL DIAGRAM (system metrics)
// ─────────────────────────────────────────────
const OrbitalDiagram = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];
  const cx = 50, cy = 50;
  const radii = [10, 18, 26, 34];
  const maxE =  [2,  8,  18, 32];
  const total = Math.round((level / 100) * 60);
  let rem = total;

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
          ...(tooltipAbove
            ? { bottom: 'calc(100% + 8px)', top: 'auto' }
            : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          minWidth: 120,
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${cat.border}`,
          borderRadius: 8,
          padding: '8px 10px',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`,
          pointerEvents: 'none',
        }}>
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
        {radii.map((r, i) => {
          const filled = Math.min(rem, maxE[i]);
          rem -= filled;
          const frac = maxE[i] > 0 ? filled / maxE[i] : 0;
          const circ = 2 * Math.PI * r;
          const arcStyle = { opacity: 0.75 + frac * 0.2, filter: `drop-shadow(0 0 ${2 + frac * 5}px ${cat.border})` };
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={cat.border} strokeWidth="0.8" opacity="0.15" />
              {frac > 0 && (
                prefersReducedMotion
                  ? <circle cx={cx} cy={cy} r={r} fill="none"
                      stroke={cat.border} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${frac * circ} ${circ}`}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      style={arcStyle}
                    />
                  : <motion.circle cx={cx} cy={cy} r={r} fill="none"
                      stroke={cat.border} strokeWidth="3" strokeLinecap="round"
                      style={arcStyle}
                      strokeDasharray={`${frac * circ} ${circ}`}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="5" fill={online ? cat.border : '#374151'} opacity="0.85"
          style={{ filter: online ? `drop-shadow(0 0 ${3 + (level / 100) * 4}px ${cat.border})` : 'none' }} />
        <text x={cx} y={cy + 18} textAnchor="middle" fill={cat.text} fontSize="7" fontFamily={MONO} opacity="0.85">
          {level.toFixed(0)}%
        </text>
      </svg>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// COORDINATION COMPLEX (server CPU/RAM metrics — Crystal Field Theory)
// ─────────────────────────────────────────────
const CoordComplex = ({ label, level, online, details = [], metal, isJahnTeller = false, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const hue = (level / 100) * 280;
  const color      = online ? `hsl(${hue}, 100%, 55%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 100%, 55%, 0.35)` : 'rgba(107,114,128,0.35)';
  const colorBg    = online ? `hsla(${hue}, 100%, 55%, 0.08)` : 'rgba(107,114,128,0.08)';

  const strongField = level > 50;
  const ligand  = strongField ? 'CN' : 'H₂O';
  const formula = `[${metal}(${ligand})₆]`;

  const spinKey = lowSpin ? 'ls' : 'hs';
  const [t2g, eg] = ELECTRON_CONFIG[metal][spinKey];

  const activityLabel = label === 'CPU_LOAD'
    ? (lowSpin ? '4K Transcode' : 'Direct Play')
    : (lowSpin ? 'Heavy Cache'  : 'Buffering');

  const gap = 10 + (level / 100) * 18;
  const cx = 50, mcy = 26;
  const axialDist = isJahnTeller ? 12 + (level / 100) * 7 : 12;

  const renderElectrons = (count, lineX, lineY, lineHalfW = 5) => {
    if (count === 0) return null;
    if (count === 1) {
      return <circle key="e" cx={lineX} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />;
    }
    return (
      <g key="pair">
        <circle cx={lineX - 3} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />
        <circle cx={lineX + 3} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />
      </g>
    );
  };

  const t2gY = 88;
  const egY  = t2gY - gap;
  const t2gXs = [30, 50, 70];
  const egXs  = [38, 62];

  const distributeElectrons = (total, orbitalCount, lowSpin) => {
    const slots = Array(orbitalCount).fill(0);
    const safeTotal = Math.min(total, orbitalCount * 2);
    if (lowSpin) {
      for (let i = 0; i < safeTotal; i++) slots[i % orbitalCount]++;
    } else {
      for (let i = 0; i < safeTotal; i++) {
        if (i < orbitalCount) slots[i]++;
        else slots[i - orbitalCount]++;
      }
    }
    return slots;
  };

  const t2gSlots = distributeElectrons(t2g, 3, lowSpin);
  const egSlots  = distributeElectrons(eg,  2, lowSpin);

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
            CFT ◆ {METAL_NAMES[metal]}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Low-Spin' : 'High-Spin'} · {formula}
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
        {/* Equatorial bonds */}
        <line x1={cx} y1={mcy} x2={34} y2={mcy} stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={66} y2={mcy} stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={cx} y2={10}  stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={cx} y2={42}  stroke={color} strokeWidth="1" opacity="0.6" />

        {/* Axial bonds (dashed, perspective) */}
        <line x1={cx} y1={mcy} x2={cx - axialDist} y2={mcy - axialDist * 0.5}
          stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        <line x1={cx} y1={mcy} x2={cx + axialDist} y2={mcy - axialDist * 0.5}
          stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

        {/* Equatorial ligand atoms */}
        <circle cx={34} cy={mcy} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={66} cy={mcy} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx} cy={10}  r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx} cy={42}  r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />

        {/* Axial ligand atoms */}
        <circle cx={cx - axialDist} cy={mcy - axialDist * 0.5} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx + axialDist} cy={mcy - axialDist * 0.5} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />

        {/* Metal center */}
        <circle cx={cx} cy={mcy} r="6" fill={colorBg} stroke={color} strokeWidth="1.5"
          style={{ filter: online ? `drop-shadow(0 0 ${2 + (level/100)*4}px ${color})` : 'none' }} />
        <text x={cx} y={mcy + 2.5} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} fontWeight="bold">
          {metal}
        </text>

        {/* eg label */}
        <text x="14" y={egY + 1.5} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} opacity="0.6">eᵍ</text>

        {/* t2g label */}
        <text x="14" y={t2gY + 1.5} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} opacity="0.6">t₂g</text>

        {/* Δo bracket */}
        <line x1="20" y1={egY} x2="20" y2={t2gY} stroke={color} strokeWidth="0.5" opacity="0.25" />
        <line x1="18" y1={egY} x2="22" y2={egY} stroke={color} strokeWidth="0.5" opacity="0.25" />
        <line x1="18" y1={t2gY} x2="22" y2={t2gY} stroke={color} strokeWidth="0.5" opacity="0.25" />

        {/* eg orbitals */}
        {egXs.map((x, i) => (
          <g key={`eg${i}`}>
            <line x1={x - 5} y1={t2gY - gap} x2={x + 5} y2={t2gY - gap} stroke={color} strokeWidth="1.2" opacity="0.7" />
            {egSlots[i] > 0 && renderElectrons(egSlots[i], x, t2gY - gap)}
          </g>
        ))}

        {/* t2g orbitals */}
        {t2gXs.map((x, i) => (
          <g key={`t2g${i}`}>
            <line x1={x - 5} y1={t2gY} x2={x + 5} y2={t2gY} stroke={color} strokeWidth="1.2" opacity="0.7" />
            {t2gSlots[i] > 0 && renderElectrons(t2gSlots[i], x, t2gY)}
          </g>
        ))}
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{formula}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Low-Spin' : 'High-Spin'} | {activityLabel}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// JABLONSKI DIAGRAM (NET_DOWN = emission, NET_UP = excitation)
// ─────────────────────────────────────────────
const JablonskiDiagram = ({ label, level, online, details = [], variant = 'excitation', size = 88 }) => {
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
            {isEmission ? 'JABLONSKI ◆ EMISSION' : 'JABLONSKI ◆ EXCITATION'}
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

// ─────────────────────────────────────────────
// SPEEDTEST SPARKLINE — NH-08
// ─────────────────────────────────────────────
const SparkRow = ({ label, poly, color }) => {
  if (!poly) return null;
  const W = 160, H = 36;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 40 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        <polyline points={poly.points} fill="none" stroke={color} strokeWidth="1.5"
          opacity="0.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{poly.latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{poly.max} ↓{poly.min}</span>
      </div>
    </div>
  );
};

const SpeedtestSparkline = () => {
  const [data, setData] = React.useState({ srv1: [], srv2: [] });

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('speedtest_v2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const take = (arr) =>
        Array.isArray(arr)
          ? arr.slice(-10).map(r => ({ ts: r.ts, mbps: typeof r.mbps === 'number' ? r.mbps : 0 }))
          : [];
      setData({ srv1: take(parsed.srv1), srv2: take(parsed.srv2) });
    } catch (_) {}
  }, []);

  const buildPolyline = (pts, width, height) => {
    if (pts.length < 2) return null;
    const vals = pts.map(p => p.mbps);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = width / (pts.length - 1);
    const points = pts.map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.mbps - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return { points, min: min.toFixed(0), max: max.toFixed(0), latest: vals[vals.length - 1].toFixed(0) };
  };

  const W = 160, H = 36;
  const s1 = buildPolyline(data.srv1, W, H);
  const s2 = buildPolyline(data.srv2, W, H);

  if (!s1 && !s2) {
    if (data.srv1.length === 0 && data.srv2.length === 0) {
      return (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em', padding: 16 }}>
          NO_SPEEDTEST_DATA — run a test first
        </div>
      );
    }
    return (
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.15em', padding: '6px 0' }}>NO_SPEEDTEST_DATA</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SPEEDTEST_HISTORY</div>
      <SparkRow label="SRV-1" poly={s1} color="#22d3ee" />
      <SparkRow label="SRV-2" poly={s2} color="#a78bfa" />
    </div>
  );
};

// ─────────────────────────────────────────────
// SYSTEM METRICS PANEL
// ─────────────────────────────────────────────
const statusColor = (status, health) => {
  if (status !== 'running') return '#f87171';
  if (health === 'unhealthy') return '#f87171';
  if (health === 'starting')  return '#fde047';
  return '#4ade80';
};

const uptimeStr = (startedAt) => {
  if (!startedAt) return '';
  const ms = Date.now() - new Date(startedAt);
  if (ms < 0) return '';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const DockerHealthWidget = ({ data, isLoading, isError }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [showHealthy, setShowHealthy] = React.useState(false);
  const containers = data?.containers ?? [];
  const unhealthy = containers.filter(c => c.status !== 'running' || c.health === 'unhealthy');
  const healthy   = containers.filter(c => c.status === 'running'  && c.health !== 'unhealthy')
                               .sort((a, b) => b.restart_count - a.restart_count);

  const ContainerRow = ({ c }) => {
    const color = statusColor(c.status, c.health);
    const restartColor = c.restart_count === 0 ? 'rgba(255,255,255,0.35)' : c.restart_count <= 5 ? '#fb923c' : '#f87171';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 8px', background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.8)',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
        <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          {uptimeStr(c.started_at)}
        </span>
        {c.restart_count > 0 && (
          <span style={{ fontFamily: MONO, fontSize: 7, color: restartColor, flexShrink: 0 }}>
            ↺{c.restart_count}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.35)' }}>
          ◆ DOCKER_HEALTH
        </span>
        {unhealthy.length > 0 && (
          <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', borderRadius: 3,
            background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)',
            color: '#f87171', letterSpacing: '0.1em' }}>
            {unhealthy.length} ALERT{unhealthy.length !== 1 ? 'S' : ''}
          </span>
        )}
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 8 }}>
          {isLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>}
          {isError && <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>DOCKER_UNAVAILABLE</div>}
          {!isLoading && !isError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {unhealthy.length === 0 && healthy.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>NO_CONTAINERS</div>
              )}
              {unhealthy.map(c => <ContainerRow key={c.name} c={c} />)}
              {healthy.length > 0 && (
                <button onClick={() => setShowHealthy(v => !v)}
                  style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {showHealthy ? '▾' : '▸'} {healthy.length} service{healthy.length !== 1 ? 's' : ''} healthy
                </button>
              )}
              {showHealthy && healthy.map(c => <ContainerRow key={c.name} c={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SystemMetricsPanel = ({ addLog, transcodingActive, plexStatsLevel }) => {
  const _stored = loadStoredResults();
  const bwRefLive = useRef({ srv1: _stored?.srv1?.downloadMbps ?? 100, srv2: _stored?.srv2?.downloadMbps ?? 100 });
  const [bwRef, setBwRef] = useState({ srv1: _stored?.srv1?.downloadMbps ?? 100, srv2: _stored?.srv2?.downloadMbps ?? 100 });

  const dockerQuery = useQuery({
    queryKey: ['docker-containers'],
    queryFn: async () => {
      const res = await fetch('/api/docker/containers');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
    onError: (err) => { if (addLog) addLog('DOCKER-HEALTH', `Failed: ${err.message}`, 'warn'); },
  });

  // SRV-1 Glances metrics
  const srv1Query = useQuery({
    queryKey: ['glances-srv1'],
    queryFn: async () => {
      let ramPct = 0, ramGB = '?', totalGB = '?';
      let cpuStats = { level: 45, isBoiling: false, details: [], online: true };
      let ramStats = { level: 60, isBoiling: false, details: [], online: true };
      let bandwidthStats = { level: 30, isBoiling: false, details: [], online: true };
      let bw1UpStats = { level: 0, isBoiling: false, details: [], online: true };
      let driveC = defaultStats(), driveJ = defaultStats(), driveQ = defaultStats(), driveT = defaultStats();
      let bwMbps = 0, bwIface = '';
      let storageLog = [];

      // RAM
      try {
        const memRes = await fetch('/api/glances/api/4/mem');
        if (memRes.ok) {
          const mem = await memRes.json();
          ramPct   = mem.percent ?? 0;
          ramGB    = (mem.used  / 1e9).toFixed(1);
          totalGB  = (mem.total / 1e9).toFixed(1);
          ramStats = { level: ramPct, online: true, isBoiling: ramPct > 80,
            details: [{ label: 'USED', value: `${ramGB} GB` }, { label: 'TOTAL', value: `${totalGB} GB` }] };
        }
      } catch (_) {}

      // Storage
      try {
        const [fsRes, diskioRes] = await Promise.all([
          fetch('/api/glances/api/4/fs'),
          fetch('/api/glances/api/4/diskio').catch(() => null),
        ]);

        let diskioMap = {};
        if (diskioRes?.ok) {
          const diskioData = await diskioRes.json();
          const physical = diskioData.filter(d => !d.disk_name.startsWith('loop') && !d.disk_name.startsWith('ram'));
          for (const d of physical) {
            const dt = Math.max(d.time_since_update ?? 1, 0.1);
            diskioMap[d.disk_name.toLowerCase()] = {
              readMBps:  ((d.read_bytes  ?? 0) / dt / 1e6).toFixed(1),
              writeMBps: ((d.write_bytes ?? 0) / dt / 1e6).toFixed(1),
            };
          }
        }
        const findIO = (letter) => diskioMap[`${letter}:`] || diskioMap[letter] || null;
        const ioDetails = (io) => io
          ? [{ label: 'I',  value: `${io.readMBps} MB/s` }, { label: 'O', value: `${io.writeMBps} MB/s` }]
          : [];

        if (fsRes.ok) {
          const fsData = await fsRes.json();
          const norm = (s) => (s ?? '').toLowerCase().replace(/\\/g, '/').replace(/\/$/, '');
          const find = (mnt, winDrive) => fsData.find(f => norm(f.mnt_point) === norm(mnt)) || fsData.find(f => norm(f.mnt_point) === norm(winDrive));
          const toStats = (f, letter) => f
            ? { level: f.percent, isBoiling: f.percent > 85, online: true,
                details: [
                  { label: 'USED', value: `${(f.used/1e9).toFixed(1)} GB` },
                  { label: 'FREE', value: `${(f.free/1e9).toFixed(1)} GB` },
                  ...ioDetails(findIO(letter)),
                ] }
            : defaultStats();
          const c = find('/mnt/c', 'C:'), j = find('/mnt/j', 'J:'), q = find('/mnt/q', 'Q:'), t = find('/mnt/t', 'T:');
          driveC = toStats(c, 'c'); driveJ = toStats(j, 'j'); driveQ = toStats(q, 'q'); driveT = toStats(t, 't');
          storageLog = [c && `C:${c.percent.toFixed(0)}%`, j && `J:${j.percent.toFixed(0)}%`,
                        q && `Q:${q.percent.toFixed(0)}%`, t && `T:${t.percent.toFixed(0)}%`].filter(Boolean);
        }
      } catch (_) {}

      // Bandwidth
      try {
        const netRes = await fetch('/api/glances/api/4/network');
        if (netRes.ok) {
          const nets = await netRes.json();
          const best = nets
            .filter(n => !['lo'].includes(n.interface_name) && !n.interface_name.startsWith('br-') && !n.interface_name.startsWith('docker') && !n.interface_name.startsWith('veth'))
            .sort((a, b) => ((b.rx ?? 0) + (b.tx ?? 0)) - ((a.rx ?? 0) + (a.tx ?? 0)))[0];
          if (best) {
            const dt = Math.max(best.time_since_update ?? 1, 0.1);
            const rxBps = best.rx ?? (best.bytes_recv != null ? best.bytes_recv / dt : 0);
            const txBps = best.tx ?? (best.bytes_sent != null ? best.bytes_sent / dt : 0);
            const rxMbps = (rxBps * 8) / 1e6;
            const txMbps = (txBps * 8) / 1e6;
            bwMbps  = rxMbps;
            bwIface = best.interface_name;
            bandwidthStats = { level: Math.min((rxMbps / bwRefLive.current.srv1) * 100, 100), online: true, isBoiling: rxMbps > bwRefLive.current.srv1 * 0.8,
              details: [{ label: 'IFACE', value: bwIface }, { label: 'DOWN', value: `${rxMbps.toFixed(1)} Mbps` }] };
            bw1UpStats = { level: Math.min((txMbps / bwRefLive.current.srv1) * 100, 100), online: true, isBoiling: txMbps > bwRefLive.current.srv1 * 0.8,
              details: [{ label: 'IFACE', value: bwIface }, { label: 'UP', value: `${txMbps.toFixed(1)} Mbps` }] };
          }
        }
      } catch (_) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          bwMbps = conn.downlink || 0;
          bandwidthStats = { level: Math.min((bwMbps / bwRefLive.current.srv1) * 100, 100), online: true,
            details: [{ label: 'DOWNLINK', value: `${bwMbps} Mbps` }] };
        }
      }

      // CPU
      try {
        const cpuRes = await fetch('/api/glances/api/4/cpu');
        if (cpuRes.ok) {
          const cpu = await cpuRes.json();
          const pct = cpu.total ?? 0;
          cpuStats = { level: pct, online: true, isBoiling: pct > 70,
            details: [{ label: 'LOAD', value: `${pct.toFixed(1)}%` }] };
        }
      } catch (_) { cpuStats = { ...cpuStats, online: false }; }

      return { cpuStats, ramStats, bandwidthStats, bw1UpStats, driveC, driveJ, driveQ, driveT,
               ramPct, ramGB, totalGB, bwMbps, bwIface, storageLog };
    },
    refetchInterval: 5_000,
  });

  // SRV-2 Glances metrics
  const srv2Query = useQuery({
    queryKey: ['glances-srv2'],
    queryFn: async () => {
      let cpu2Stats = { level: 0, isBoiling: false, details: [], online: false };
      let ram2Stats = { level: 0, isBoiling: false, details: [], online: false };
      let bw2Stats  = { level: 0, isBoiling: false, details: [], online: false };
      let bw2UpStats = { level: 0, isBoiling: false, details: [], online: false };
      let driveC2 = defaultStats();

      // CPU
      try {
        const cpuRes = await fetch('/api/glances2/api/4/cpu');
        if (cpuRes.ok) {
          const cpu = await cpuRes.json();
          const pct = cpu.total ?? 0;
          cpu2Stats = { level: pct, online: true, isBoiling: pct > 70,
            details: [{ label: 'LOAD', value: `${pct.toFixed(1)}%` }] };
        }
      } catch (_) { cpu2Stats = { ...cpu2Stats, online: false }; }

      // RAM
      try {
        const memRes = await fetch('/api/glances2/api/4/mem');
        if (memRes.ok) {
          const mem = await memRes.json();
          const pct = mem.percent ?? 0;
          ram2Stats = { level: pct, online: true, isBoiling: pct > 80,
            details: [{ label: 'USED', value: `${(mem.used/1e9).toFixed(1)} GB` }, { label: 'TOTAL', value: `${(mem.total/1e9).toFixed(1)} GB` }] };
        }
      } catch (_) { ram2Stats = { ...ram2Stats, online: false }; }

      // C:\ drive + diskio
      try {
        const [fsRes, diskioRes2] = await Promise.all([
          fetch('/api/glances2/api/4/fs'),
          fetch('/api/glances2/api/4/diskio').catch(() => null),
        ]);
        let diskioMap2 = {};
        if (diskioRes2?.ok) {
          const diskioData2 = await diskioRes2.json();
          for (const d of diskioData2.filter(d => !d.disk_name.startsWith('loop') && !d.disk_name.startsWith('ram'))) {
            const dt = Math.max(d.time_since_update ?? 1, 0.1);
            diskioMap2[d.disk_name.toLowerCase()] = {
              readMBps:  ((d.read_bytes  ?? 0) / dt / 1e6).toFixed(1),
              writeMBps: ((d.write_bytes ?? 0) / dt / 1e6).toFixed(1),
            };
          }
        }
        const findIO2 = (letter) => diskioMap2[`${letter}:`] || diskioMap2[letter] || null;
        if (fsRes.ok) {
          const fsData = await fsRes.json();
          const norm = (s) => (s ?? '').toLowerCase().replace(/\\/g, '/').replace(/\/$/, '');
          const f = fsData.find(d => norm(d.mnt_point) === 'c:') || fsData.find(d => norm(d.mnt_point) === '/mnt/c');
          const io = findIO2('c');
          driveC2 = f
            ? { level: f.percent, isBoiling: f.percent > 85, online: true,
                details: [
                  { label: 'USED', value: `${(f.used/1e9).toFixed(1)} GB` },
                  { label: 'FREE', value: `${(f.free/1e9).toFixed(1)} GB` },
                  ...(io ? [{ label: 'I', value: `${io.readMBps} MB/s` }, { label: 'O', value: `${io.writeMBps} MB/s` }] : []),
                ] }
            : defaultStats();
        }
      } catch (_) { driveC2 = { ...driveC2, online: false }; }

      // Bandwidth — split DOWN / UP
      try {
        const netRes = await fetch('/api/glances2/api/4/network');
        if (netRes.ok) {
          const nets = await netRes.json();
          const candidates = nets.filter(
            n => !['lo'].includes(n.interface_name) &&
                 !n.interface_name.startsWith('br-') &&
                 !n.interface_name.startsWith('docker') &&
                 !n.interface_name.startsWith('veth')
          );
          const best = candidates.find(n => n.interface_name === 'Ethernet') ??
                       candidates.sort((a, b) => ((b.rx ?? 0) + (b.tx ?? 0)) - ((a.rx ?? 0) + (a.tx ?? 0)))[0];
          if (best) {
            const dt = Math.max(best.time_since_update ?? 1, 0.1);
            const rxBps = best.rx ?? (best.bytes_recv != null ? best.bytes_recv / dt : 0);
            const txBps = best.tx ?? (best.bytes_sent != null ? best.bytes_sent / dt : 0);
            const rxMbps = (rxBps * 8) / 1e6;
            const txMbps = (txBps * 8) / 1e6;
            bw2Stats = { level: Math.min((rxMbps / bwRefLive.current.srv2) * 100, 100), online: true, isBoiling: rxMbps > bwRefLive.current.srv2 * 0.8,
              details: [{ label: 'IFACE', value: best.interface_name }, { label: 'DOWN', value: `${rxMbps.toFixed(1)} Mbps` }] };
            bw2UpStats = { level: Math.min((txMbps / bwRefLive.current.srv2) * 100, 100), online: true, isBoiling: txMbps > bwRefLive.current.srv2 * 0.8,
              details: [{ label: 'IFACE', value: best.interface_name }, { label: 'UP', value: `${txMbps.toFixed(1)} Mbps` }] };
          }
        }
      } catch (_) { bw2Stats = { ...bw2Stats, online: false }; bw2UpStats = { ...bw2UpStats, online: false }; }

      return { cpu2Stats, ram2Stats, bw2Stats, bw2UpStats, driveC2 };
    },
    refetchInterval: 5_000,
  });

  // Logging (throttled — log every 6th poll = every 30s)
  const metricsLogTick = useRef(0);
  useEffect(() => {
    if (!srv1Query.data) return;
    metricsLogTick.current++;
    if (metricsLogTick.current % 6 === 0) {
      const { ramPct, ramGB, totalGB, bwMbps, bwIface, storageLog } = srv1Query.data;
      if (ramPct > 0)            addLog('RAM',       `Used: ${ramGB} GB / ${totalGB} GB (${ramPct.toFixed(0)}%)`, ramPct > 80 ? 'warn' : 'info');
      if (bwMbps > 0)            addLog('BANDWIDTH',  `${bwIface}: ${bwMbps.toFixed(1)} Mbps`,                    bwMbps < 1  ? 'warn' : 'info');
      if (storageLog.length > 0) addLog('STORAGE',    storageLog.join(' | '),                                      'info');
    }
  }, [srv1Query.data, addLog]);

  // Daily speed test
  useEffect(() => {
    const stored = loadStoredResults();
    const needsTest = !stored || isStale(stored.srv1?.timestamp ?? 0);
    if (!needsTest) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const r1 = await runSpeedTestForServer(SRV1_PATH, controller.signal);
      const r2 = await runSpeedTestForServer(SRV2_PATH, controller.signal);
      const srv1Mbps = r1?.downloadMbps ?? (stored?.srv1?.downloadMbps ?? 100);
      const srv2Mbps = r2?.downloadMbps ?? (stored?.srv2?.downloadMbps ?? 100);
      bwRefLive.current = { srv1: srv1Mbps, srv2: srv2Mbps };
      setBwRef({ srv1: srv1Mbps, srv2: srv2Mbps });
      saveResults(srv1Mbps, srv2Mbps);
    }, 30000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  const cpuStats      = srv1Query.data?.cpuStats      ?? { level: 45, isBoiling: false, details: [], online: true };
  const ramStats      = srv1Query.data?.ramStats      ?? { level: 60, isBoiling: false, details: [], online: true };
  const bandwidthStats = srv1Query.data?.bandwidthStats ?? { level: 30, isBoiling: false, details: [], online: true };
  const bw1UpStats    = srv1Query.data?.bw1UpStats    ?? { level: 0, isBoiling: false, details: [], online: true };
  const driveC        = srv1Query.data?.driveC        ?? defaultStats();
  const driveJ        = srv1Query.data?.driveJ        ?? defaultStats();
  const driveQ        = srv1Query.data?.driveQ        ?? defaultStats();
  const driveT        = srv1Query.data?.driveT        ?? defaultStats();

  const cpu2Stats  = srv2Query.data?.cpu2Stats  ?? { level: 0, isBoiling: false, details: [], online: false };
  const ram2Stats  = srv2Query.data?.ram2Stats  ?? { level: 0, isBoiling: false, details: [], online: false };
  const bw2Stats   = srv2Query.data?.bw2Stats   ?? { level: 0, isBoiling: false, details: [], online: false };
  const bw2UpStats = srv2Query.data?.bw2UpStats ?? { level: 0, isBoiling: false, details: [], online: false };
  const driveC2    = srv2Query.data?.driveC2    ?? defaultStats();

  const cpuLowSpin  = transcodingActive;
  const ramLowSpin  = plexStatsLevel > 40;
  const cpu2LowSpin = transcodingActive;
  const ram2LowSpin = ram2Stats.level > 60;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
      <div className="flex gap-0 items-start">

        {/* Column 1 — SRV-1 */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            ◆ SRV-1 ◆ Coordination_Complex
          </div>
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <CoordComplex size={110} label="CPU_LOAD"  level={cpuStats.level} online={cpuStats.online} details={cpuStats.details} metal="Fe" lowSpin={cpuLowSpin} />
            <CoordComplex size={110} label="RAM_USAGE" level={ramStats.level} online={ramStats.online} details={ramStats.details} metal="Co" lowSpin={ramLowSpin} />
            <JablonskiDiagram size={110} label="NET_DOWN" level={bandwidthStats.level} online={bandwidthStats.online} details={bandwidthStats.details} variant="emission"   />
            <JablonskiDiagram size={110} label="NET_UP"   level={bw1UpStats.level}     online={bw1UpStats.online}     details={bw1UpStats.details}     variant="excitation" />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px flex-shrink-0 self-stretch bg-white/12 my-2" />

        {/* Column 2 — Storage */}
        <div className="flex-1 min-w-0 min-w-[280px] px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            ◆ Storage_Drives ◆ Orbital_Fill_Diagram
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <OrbitalDiagram size={110} label="SRV-1"        level={driveC.level}  online={driveC.online}  details={driveC.details}  catKey="PNICTOGEN"  />
            <OrbitalDiagram size={110} label="TV"           level={driveJ.level}  online={driveJ.online}  details={driveJ.details}  catKey="CHALCOGEN"  />
            <OrbitalDiagram size={110} label="MOVIES"       level={driveQ.level}  online={driveQ.online}  details={driveQ.details}  catKey="LANTHANIDE" />
            <OrbitalDiagram size={110} label="MUSIC_PHOTOS" level={driveT.level}  online={driveT.online}  details={driveT.details}  catKey="ACTINIDE"   />
            <OrbitalDiagram size={110} label="SRV-2_OS"     level={driveC2.level} online={driveC2.online} details={driveC2.details} catKey="HALOGEN"    />
          </div>
          {/* NH-08: Speedtest sparkline */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <SpeedtestSparkline />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px flex-shrink-0 self-stretch bg-white/12 my-2" />

        {/* Column 3 — SRV-2 */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
            ◆ SRV-2 ◆ Coordination_Complex
          </div>
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <CoordComplex size={110} label="CPU_LOAD"  level={cpu2Stats.level} online={cpu2Stats.online} details={cpu2Stats.details} metal="Cu" isJahnTeller lowSpin={cpu2LowSpin} />
            <CoordComplex size={110} label="RAM_USAGE" level={ram2Stats.level} online={ram2Stats.online} details={ram2Stats.details} metal="Ni" lowSpin={ram2LowSpin} />
            <JablonskiDiagram size={110} label="NET_DOWN" level={bw2Stats.level}   online={bw2Stats.online}   details={bw2Stats.details}   variant="emission"   />
            <JablonskiDiagram size={110} label="NET_UP"   level={bw2UpStats.level} online={bw2UpStats.online} details={bw2UpStats.details} variant="excitation" />
          </div>
        </div>

      </div>

      <DockerHealthWidget data={dockerQuery.data} isLoading={dockerQuery.isLoading} isError={dockerQuery.isError} />
      <LanPresenceWidget />
      <CronMonitorWidget />
    </div>
  );
};

export default SystemMetricsPanel;
