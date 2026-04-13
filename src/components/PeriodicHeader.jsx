import React from 'react';
import DashboardModeToggle from './DashboardModeToggle.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import RandomizerButton from './RandomizerButton.jsx';
import LiveClock from './LiveClock.jsx';
import { getStatusTier } from '../utils/constants.js';

const SEERR_URL = 'http://10.0.0.155:5055';
const MUSIC_REQUEST_URL = 'http://10.0.0.195:5050';

const RequestButton = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
    style={{
      fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.12em',
      padding: '5px 10px', borderRadius: 4, textDecoration: 'none',
      border: '1px solid rgba(6,182,212,0.3)',
      background: 'rgba(6,182,212,0.06)', color: '#38bdf8',
      whiteSpace: 'nowrap',
      transition: 'background 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(6,182,212,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    {children}
  </a>
);

const PeriodicHeader = ({ globalTier, lastPolledAt, healthColor, dashboardMode, setDashboardMode, modeThemes, headerTitle, headerSubtitle }) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const tier = globalTier || getStatusTier(0);
  const badgeColorMap = {
    'text-cyan-400':   { text: '#22d3ee', border: 'rgba(6,182,212,0.3)',  bg: 'rgba(8,51,68,0.2)',   dot: '#22d3ee'  },
    'text-yellow-300': { text: '#fde047', border: 'rgba(250,204,21,0.3)', bg: 'rgba(66,54,8,0.2)',   dot: '#fde047'  },
    'text-amber-400':  { text: '#fb923c', border: 'rgba(245,158,11,0.4)', bg: 'rgba(69,26,3,0.2)',   dot: '#fb923c'  },
    'text-red-400':    { text: '#f87171', border: 'rgba(239,68,68,0.5)',  bg: 'rgba(69,10,10,0.2)',  dot: '#f87171'  },
  };
  const badgeStyle = healthColor || badgeColorMap[tier.color] || badgeColorMap['text-cyan-400'];
  return (
    <header className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
      <div>
        <h1 className="text-2xl font-light tracking-tighter text-white">
          {(headerTitle?.main) || 'ELEMENT_TABLE'}<span className="text-cyan-400 font-bold">{(headerTitle?.accent) || '.SYS'}</span>
        </h1>
        <p className="text-[9px] font-mono text-white/30 tracking-[0.3em] mt-0.5">
          {(headerSubtitle || 'Period 4 ◆ Group {date} ◆ Homelab Services Dashboard').replace('{date}', dateStr)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RequestButton href={SEERR_URL}>Request MOVIES/TV</RequestButton>
        <RequestButton href={MUSIC_REQUEST_URL}>Request Music</RequestButton>
        <DashboardModeToggle mode={dashboardMode} setMode={setDashboardMode} />
        <ThemeSelector dashboardMode={dashboardMode} modeThemes={modeThemes} />
        <RandomizerButton dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} />
        <LiveClock />
        {lastPolledAt && (
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
            LAST_POLL: {lastPolledAt}
          </span>
        )}
        {/* THEME_INVARIANT: badgeColorMap status tier colors (cyan/yellow/amber/red) stay fixed across themes */}
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '6px 12px', border: `1px solid ${badgeStyle.border}`, borderRadius: 4,
          color: badgeStyle.text, background: badgeStyle.bg, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="motion-safe:animate-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: badgeStyle.dot }} />
          {tier.label}
        </div>
      </div>
    </header>
  );
};

export default PeriodicHeader;
