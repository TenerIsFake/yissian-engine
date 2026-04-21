import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../themes/ThemeContext.jsx';
import { MODE_THEMES, MODE_DEFAULT_THEME, THEMES } from '../themes/themeConfig.js';

const MONO = 'monospace';

const MODES = [
  { id: 'CHEM',     icon: '⚗',  label: 'CHEM'     },
  { id: 'SPACE',    icon: '✦',  label: 'SPACE'    },
  { id: 'NEURAL',   icon: '⬡',  label: 'NEURAL'   },
  { id: 'ARCANE',   icon: '✧',  label: 'ARCANE'   },
  { id: 'BIO',      icon: '❋',  label: 'BIO'      },
  { id: 'MOLECULE', icon: '⚛',  label: 'MOLECULE' },
  { id: 'PLANET',   icon: '◉',  label: 'PLANET'   },
  { id: 'WEATHER',  icon: '☁',  label: 'WEATHER'  },
  { id: 'AIRPORT',  icon: '✈',  label: 'AIRPORT'  },
  { id: 'DINO',     icon: '❊',  label: 'DINO'     },
  { id: 'NOIR',     icon: '◈',  label: 'NOIR'     },
  { id: 'VINYL',    icon: '◎',  label: 'VINYL'    },
  { id: 'BAND',     icon: '♫',  label: 'BAND'     },
  { id: 'PARTICLE', icon: '⊛',  label: 'PARTICLE' },
  { id: 'GLOBE',    icon: '⊕',  label: 'GLOBE'    },
  { id: 'FORGE',    icon: '⚒',  label: 'FORGE'    },
  { id: 'OCEAN',    icon: '≋',  label: 'OCEAN'    },
  { id: 'SCHLENK',  icon: '⚗',  label: 'SCHLENK'  },
];

const DashboardModeToggle = ({ mode, setMode }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const { activeTheme, setActiveTheme, setCurrentModeThemes } = useTheme();

  const current = MODES.find(m => m.id === mode) ?? MODES[0];
  const accent = THEMES[activeTheme]?.accent || '#22d3ee';

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const selectMode = (m) => {
    localStorage.setItem('jenkins-media-dashboard-mode', m.id);
    setMode(m.id);
    // Switch theme to the new mode's default
    const themes = MODE_THEMES[m.id];
    const defaultTheme = MODE_DEFAULT_THEME[m.id];
    if (themes && defaultTheme) {
      setCurrentModeThemes(themes, defaultTheme);
      setActiveTheme(defaultTheme);
    }
    close();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger button — same visual as before */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        aria-label={`Dashboard mode: ${current.label}. Click to select a mode.`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        style={{
          fontFamily: MONO,
          fontSize: 8,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.55)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
      >
        <span style={{ fontSize: 11 }}>{current.icon}</span>
        {current.label}
        <span style={{ fontSize: 7, opacity: 0.5, marginLeft: 2 }}>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Select dashboard mode"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'rgba(12,12,18,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '8px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            minWidth: 240,
          }}
        >
          {MODES.map(m => {
            const isActive = m.id === mode;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={isActive}
                onClick={() => selectMode(m)}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/60"
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  letterSpacing: '0.1em',
                  color: isActive ? accent : 'rgba(255,255,255,0.5)',
                  background: isActive ? `${accent}18` : 'transparent',
                  border: isActive ? `1px solid ${accent}40` : '1px solid transparent',
                  borderRadius: 4,
                  padding: '6px 4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardModeToggle;
