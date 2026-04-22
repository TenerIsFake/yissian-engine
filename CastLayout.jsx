import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { useDashboard } from './src/context/DashboardContext.jsx';
import { MONO } from './src/utils/constants.js';
import SecurityBadgeRow from './src/components/SecurityBadgeRow.jsx';
import { activeCATRef, ThemeContext } from './src/themes/ThemeContext.jsx';
import AnimatedBackground from './src/themes/AnimatedBackground.jsx';
import { THEMES } from './src/themes/themeConfig.js';
import { SERVICE_REGISTRY, ALL_ELEMENTS } from './src/data/serviceRegistry.js';
import MODE_REGISTRY from './src/modeRegistry.js';

// Natural (unscaled) inner dimensions per mode. Grid components render at
// these sizes; CastLayout scales with translate+scale to fit the container.
// Unlisted modes fall back to CHEM's 1336x760.
const MODE_NATURAL_SIZE = {
  CHEM:    [1336, 760],  // periodic table: 18 cols × 72 + gaps + padding
  SCHLENK: [1400, 660],  // Schlenk bench scene viewBox
};
const FALLBACK_SIZE = MODE_NATURAL_SIZE.CHEM;

// ─────────────────────────────────────────────
// CLOCK
// ─────────────────────────────────────────────
function CastClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hhmm = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const ss   = String(now.getSeconds()).padStart(2, '0');
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ textAlign: 'right', flexShrink: 0, userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 }}>
        <span style={{
          fontFamily: MONO, fontSize: 40, fontWeight: 200,
          color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {hhmm}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 16, color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
          {ss}
        </span>
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.28)',
        letterSpacing: '0.25em', marginTop: 4,
      }}>
        {date.toUpperCase()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LEGEND — vertical category + zone color key
// ─────────────────────────────────────────────
const LEGEND_KEYS = ['LANTHANIDE', 'ACTINIDE', 'TRANSITION', 'NOBLE', 'CHALCOGEN', 'METALLOID'];
const ZONE_ENTRIES = [
  { label: 'MEDIA',    color: '#55EFC4' },
  { label: 'LIBRARY',  color: '#74B9FF' },
  { label: 'PIPELINE', color: '#FDCB6E' },
];

function CastLegend({ dashboardMode }) {
  const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-start' }}>

      <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em', marginBottom: 8 }}>
        ◆ CATEGORIES
      </div>

      {LEGEND_KEYS.map(key => {
        const cat = activeCATRef.current[key];
        const label = reg.labels?.[key] ?? key;
        if (!cat) return null;
        return (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
            padding: '4px 0',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: cat.border, flexShrink: 0,
              boxShadow: `0 0 5px ${cat.border}`,
            }} />
            {label}
          </div>
        );
      })}

      <div style={{
        width: '100%', height: 1,
        background: 'rgba(255,255,255,0.06)',
        margin: '10px 0',
      }} />

      <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em', marginBottom: 8 }}>
        ◆ ZONES
      </div>

      {ZONE_ENTRIES.map(z => (
        <div key={z.label} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.04em',
          padding: '4px 0',
        }}>
          <span style={{
            width: 16, height: 2,
            background: z.color, flexShrink: 0, opacity: 0.7,
          }} />
          {z.label}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// CAST LAYOUT
// ─────────────────────────────────────────────
export default function CastLayout() {
  const { weatherStats, weatherForecast, statsMap, dashboardMode } = useDashboard();
  const { sceneConfig, animationTier, activeTheme } = useContext(ThemeContext) ?? {};
  const { temp, feelsLike, humidity, windSpeed, condition, online } = weatherStats;

  // Per-mode Grid dispatch: use modeRegistry's Grid component + its natural size
  const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
  const Grid = reg.CastGrid ?? reg.Grid;
  const [tableW, tableH] = MODE_NATURAL_SIZE[dashboardMode] ?? FALLBACK_SIZE;

  const tableRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const recalc = () => {
      if (!tableRef.current) return;
      const { clientWidth, clientHeight } = tableRef.current;
      // Scale to fit both dimensions; cap upscale at 1.5×
      const s = Math.min(clientWidth / tableW, clientHeight / tableH, 1.5);
      setScale(Math.max(s, 0.35));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (tableRef.current) ro.observe(tableRef.current);
    return () => ro.disconnect();
  }, [tableW, tableH]);

  const weatherDetails = [
    feelsLike !== null && `FEELS ${Math.round(feelsLike)}°`,
    humidity  !== null && `HUM ${humidity}%`,
    windSpeed !== null && `${Math.round(windSpeed)} MPH`,
  ].filter(Boolean).join('  ·  ');

  const isSchlenk = dashboardMode === 'SCHLENK';

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      background: 'var(--bg-base, #0F1117)',
      display: 'flex', flexDirection: 'column',
    }}>
      <AnimatedBackground
        sceneConfig={sceneConfig}
        tier={animationTier}
        accent={THEMES[activeTheme]?.accent}
      />

      {/* ── TOP BAR: weather (conditions | forecast) + clock ── */}
      <div style={{
        flexShrink: 0,
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        background: 'rgba(10,12,18,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative', zIndex: 20,
      }}>

        {/* Weather area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 }}>
          {!online ? (
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              {online === null ? '◆ LOADING...' : '◆ PROBE OFFLINE'}
            </span>
          ) : (
            <>
              {/* Current conditions: large temp + condition + feels/hum/wind */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexShrink: 0 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 42, fontWeight: 200,
                  color: 'rgba(255,255,255,0.9)', lineHeight: 1,
                }}>
                  {temp !== null ? `${Math.round(temp)}°F` : '—'}
                </span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.58)', letterSpacing: '0.03em' }}>
                    {condition ?? '—'}
                  </div>
                  {weatherDetails && (
                    <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', marginTop: 2 }}>
                      {weatherDetails}
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 44, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

              {/* 5-day forecast — to the right of conditions */}
              {weatherForecast.length > 0 && (
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  {weatherForecast.slice(0, 5).map((d, i) => (
                    <div key={i} style={{ fontFamily: MONO, fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
                      <div style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', marginBottom: 1 }}>{d.day}</div>
                      <div style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {d.hi !== null ? `${Math.round(d.hi)}°` : '—'}
                        <span style={{ color: 'rgba(255,255,255,0.24)' }}>/{d.lo !== null ? `${Math.round(d.lo)}°` : '—'}</span>
                      </div>
                      {d.precip !== null && (
                        <div style={{ fontSize: 8, color: 'rgba(100,180,255,0.42)' }}>{d.precip}%</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Clock */}
        <CastClock />
      </div>

      {/* ── MAIN AREA: conditional on mode ── */}
      {isSchlenk ? (
        <>
          <div ref={tableRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              width: tableW,
              height: tableH,
            }}>
              <Suspense fallback={null}>
                <Grid
                  statsMap={statsMap}
                  onElementClick={() => {}}
                  elementRegistry={SERVICE_REGISTRY}
                  allElements={ALL_ELEMENTS}
                />
              </Suspense>
            </div>
          </div>
          <div style={{
            flexShrink: 0,
            padding: '8px 24px',
            background: 'rgba(10,12,18,0.92)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20,
          }}>
            <SecurityBadgeRow />
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* LEFT: security badges (vertical stack) */}
          <div style={{
            width: 158,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 10px',
            display: 'flex', alignItems: 'center',
            position: 'relative', zIndex: 10,
            overflow: 'hidden',
          }}>
            <SecurityBadgeRow vertical />
          </div>

          {/* CENTER: scene grid
              Uses position:absolute + translate(-50%,-50%) + scale() to avoid the
              flex-centering layout clip bug — natural-size element never overflows
              the container before transform is applied. */}
          <div ref={tableRef} style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            zIndex: 10,
          }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              width: tableW,
              height: tableH,
            }}>
              <Suspense fallback={null}>
                <Grid
                  statsMap={statsMap}
                  onElementClick={() => {}}
                  elementRegistry={SERVICE_REGISTRY}
                  allElements={ALL_ELEMENTS}
                />
              </Suspense>
            </div>
          </div>

          {/* RIGHT: category + zone legend (vertical) */}
          <div style={{
            width: 130,
            flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 14px',
            display: 'flex', alignItems: 'center',
            position: 'relative', zIndex: 10,
            overflow: 'hidden',
          }}>
            <CastLegend dashboardMode={dashboardMode} />
          </div>
        </div>
      )}
    </div>
  );
}
