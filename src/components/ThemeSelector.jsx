import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { THEMES, THEME_IDS } from '../themes/themeConfig.js';
import { useTheme } from '../themes/ThemeContext.jsx';

export default function ThemeSelector({ dashboardMode, modeThemes = THEME_IDS }) {
  const { activeTheme, setActiveTheme, cycleEnabled, setCycleEnabled, cycleInterval, setCycleInterval,
    modeCycleEnabled, setModeCycleEnabled, modeCycleInterval, setModeCycleInterval,
    oledMode, setOledMode, liteMode, setLiteMode } = useTheme();
  const [expanded, setExpanded]       = useState(false);
  const [showCycle, setShowCycle]     = useState(false);
  const [intervalInput, setIntervalInput] = useState(String(cycleInterval));
  const [modeIntervalInput, setModeIntervalInput] = useState(String(modeCycleInterval));
  const debounceRef  = useRef(null);
  const containerRef = useRef(null);
  const triggerRef   = useRef(null);

  const close = useCallback(() => {
    setExpanded(false);
    setShowCycle(false);
    triggerRef.current?.focus();
  }, []);

  // Keep interval inputs in sync if they change externally
  useEffect(() => { setIntervalInput(String(cycleInterval)); }, [cycleInterval]);
  useEffect(() => { setModeIntervalInput(String(modeCycleInterval)); }, [modeCycleInterval]);

  // Close on click-outside
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded, close]);

  // Escape key closes the selector
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded, close]);

  const handleIntervalChange = (val) => {
    setIntervalInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n >= 10 && n <= 86400) setCycleInterval(n);
    }, 400);
  };

  const handleModeIntervalChange = (val) => {
    setModeIntervalInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n >= 10 && n <= 86400) setModeCycleInterval(n);
    }, 400);
  };

  const accent = THEMES[activeTheme].accent;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>

      {/* ── Collapsed state ── */}
      {!expanded && (
        <>
          {(cycleEnabled || modeCycleEnabled) && (
            <span style={{
              fontSize: 7, fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em',
            }}>
              {cycleEnabled && modeCycleEnabled ? 'CYCLE:ALL' : cycleEnabled ? 'CYCLE:ON' : 'MODE:ON'}
            </span>
          )}
          <button
            ref={triggerRef}
            onClick={() => setExpanded(true)}
            title={THEMES[activeTheme].tooltip}
            aria-label={`Theme: ${dashboardMode !== 'CHEM' ? THEMES[activeTheme].spaceName : THEMES[activeTheme].name}. Click to change theme.`}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: accent,
              border: '2px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              boxShadow: `0 0 8px ${accent}88`,
              flexShrink: 0,
              padding: 0,
            }}
          />
        </>
      )}

      {/* ── Expanded state ── */}
      {expanded && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '5px 8px',
          position: 'relative',
        }}>

          {/* theme tier buttons — 5 per mode */}
          {modeThemes.map(id => {
            const theme = THEMES[id];
            if (!theme) return null;
            const isActive = id === activeTheme;
            return (
              <button
                key={id}
                onClick={() => setActiveTheme(id)}
                title={theme.tooltip}
                aria-label={`${theme.name} — tier ${theme.tier || '?'}`}
                aria-pressed={isActive}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 4,
                  background: isActive ? `${theme.accent}22` : 'transparent',
                  border: isActive ? `1px solid ${theme.accent}66` : '1px solid transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: theme.accent,
                  boxShadow: isActive ? `0 0 6px ${theme.accent}88` : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.1em',
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                  whiteSpace: 'nowrap',
                }}>
                  {theme.name}
                </span>
              </button>
            );
          })}

          {/* Clock icon — toggles cycle controls */}
          <button
            onClick={() => setShowCycle(s => !s)}
            title="Auto-cycle settings"
            aria-label="Toggle cycle controls"
            style={{
              background: showCycle ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              cursor: 'pointer',
              padding: '2px 5px',
              display: 'flex', alignItems: 'center',
              color: cycleEnabled ? accent : 'rgba(255,255,255,0.4)',
            }}
          >
            <Clock size={12} />
          </button>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Close theme selector"
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
              fontSize: 14, lineHeight: 1, padding: '1px 3px',
            }}
          >
            ×
          </button>

          {/* ── Cycle controls dropdown ── */}
          {showCycle && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: 'rgba(12,12,18,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6, padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
              zIndex: 100, minWidth: 168,
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cycleEnabled}
                  onChange={e => setCycleEnabled(e.target.checked)}
                  style={{ accentColor: accent, cursor: 'pointer' }}
                />
                <span style={{
                  fontSize: 9, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em',
                }}>
                  AUTO-CYCLE
                </span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="cycle-interval-input" style={{
                  fontSize: 8, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
                }}>
                  THEME INTERVAL (SEC)
                </label>
                <input
                  id="cycle-interval-input"
                  type="number"
                  min="10"
                  max="86400"
                  value={intervalInput}
                  onChange={e => handleIntervalChange(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 3,
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'monospace', fontSize: 10,
                    padding: '3px 7px', width: '100%',
                  }}
                />
              </div>

              {/* ── Mode rotation controls ── */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modeCycleEnabled}
                    onChange={e => setModeCycleEnabled(e.target.checked)}
                    style={{ accentColor: accent, cursor: 'pointer' }}
                  />
                  <span style={{
                    fontSize: 9, fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em',
                  }}>
                    MODE ROTATION
                  </span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  <label htmlFor="mode-interval-input" style={{
                    fontSize: 8, fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
                  }}>
                    MODE INTERVAL (SEC)
                  </label>
                  <input
                    id="mode-interval-input"
                    type="number"
                    min="10"
                    max="86400"
                    value={modeIntervalInput}
                    onChange={e => handleModeIntervalChange(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'monospace', fontSize: 10,
                      padding: '3px 7px', width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* ── OLED dark mode toggle ── */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={oledMode}
                    onChange={e => setOledMode(e.target.checked)}
                    style={{ accentColor: accent, cursor: 'pointer' }}
                  />
                  <span style={{
                    fontSize: 9, fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em',
                  }}>
                    OLED BLACK
                  </span>
                </label>
                <span style={{
                  fontSize: 7, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em',
                  marginTop: 2, display: 'block',
                }}>
                  Pure #000 background for AMOLED
                </span>
              </div>

              {/* ── Lite mode toggle ── */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={liteMode}
                    onChange={e => setLiteMode(e.target.checked)}
                    style={{ accentColor: accent, cursor: 'pointer' }}
                  />
                  <span style={{
                    fontSize: 9, fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em',
                  }}>
                    LITE MODE
                  </span>
                </label>
                <span style={{
                  fontSize: 7, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em',
                  marginTop: 2, display: 'block',
                }}>
                  Reduced particles for mobile / low-end
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
