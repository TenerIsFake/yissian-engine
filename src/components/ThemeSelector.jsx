import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { THEMES, THEME_IDS } from '../themes/themeConfig.js';
import { useTheme } from '../themes/ThemeContext.jsx';

export default function ThemeSelector({ dashboardMode, modeThemes = THEME_IDS }) {
  const { activeTheme, setActiveTheme, cycleEnabled, setCycleEnabled, cycleInterval, setCycleInterval } = useTheme();
  const [expanded, setExpanded]       = useState(false);
  const [showCycle, setShowCycle]     = useState(false);
  const [intervalInput, setIntervalInput] = useState(String(cycleInterval));
  const debounceRef  = useRef(null);
  const containerRef = useRef(null);
  const triggerRef   = useRef(null);

  const close = useCallback(() => {
    setExpanded(false);
    setShowCycle(false);
    triggerRef.current?.focus();
  }, []);

  // Keep interval input in sync if cycleInterval changes externally
  useEffect(() => {
    setIntervalInput(String(cycleInterval));
  }, [cycleInterval]);

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

  const accent = THEMES[activeTheme].accent;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>

      {/* ── Collapsed state ── */}
      {!expanded && (
        <>
          {cycleEnabled && (
            <span style={{
              fontSize: 7, fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em',
            }}>
              CYCLE:ON
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

          {/* theme swatches — filtered to current mode's 5 */}
          {modeThemes.map(id => (
            <button
              key={id}
              onClick={() => setActiveTheme(id)}
              title={THEMES[id].tooltip}
              aria-label={dashboardMode !== 'CHEM' ? THEMES[id].spaceName : THEMES[id].name}
              aria-pressed={id === activeTheme}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: THEMES[id].accent,
                border: id === activeTheme ? '2px solid #ffffff' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: `0 0 6px ${THEMES[id].accent}88`,
                flexShrink: 0,
                padding: 0,
              }}
            />
          ))}

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
                  INTERVAL (SEC)
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
