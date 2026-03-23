import React from 'react';

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
];

const DashboardModeToggle = ({ mode, setMode }) => {
  const currentIdx = MODES.findIndex(m => m.id === mode);
  const current = MODES[currentIdx] ?? MODES[0];
  const next = MODES[(currentIdx + 1) % MODES.length];

  const toggle = () => {
    localStorage.setItem('jenkins-media-dashboard-mode', next.id);
    setMode(next.id);
  };

  return (
    <button
      onClick={toggle}
      title={`Switch to ${next.label} mode`}
      aria-label={`Dashboard mode: ${current.label}. Click to switch to ${next.label} mode.`}
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
    </button>
  );
};

export default DashboardModeToggle;
