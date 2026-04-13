import React from 'react';
import { activeCATRef } from '../themes/ThemeContext.jsx';

const MONO = 'monospace';
const PRIMARY_URL = 'http://10.0.0.195';
const SECONDARY_URL = 'http://10.0.0.155';
const MUSIC_REQUEST_URL = `${PRIMARY_URL}:5050`;
const SEERR_URL = `${SECONDARY_URL}:5055`;

export const QuickLaunchPanel = ({ headerLabel }) => {
  const buttons = [
    { label: 'PLEX',        sublabel: 'MEDIA_SERVER',   url: `${PRIMARY_URL}:32400/web`, catKey: 'LANTHANIDE', desc: 'Stream media' },
    { label: 'SEERR',       sublabel: 'REQUESTS',       url: SEERR_URL,                  catKey: 'LANTHANIDE', desc: 'Movies & TV' },
    { label: 'RADARR',      sublabel: 'MOVIES',         url: `${PRIMARY_URL}:7878`,      catKey: 'LANTHANIDE', desc: 'Movie manager' },
    { label: 'SONARR',      sublabel: 'TV_SERIES',      url: `${PRIMARY_URL}:8989`,      catKey: 'LANTHANIDE', desc: 'TV manager' },
    { label: 'LIDARR',      sublabel: 'MUSIC',          url: `${PRIMARY_URL}:8686`,      catKey: 'LANTHANIDE', desc: 'Music manager' },
    { label: 'QBITTORRENT', sublabel: 'TORRENTS',       url: `${PRIMARY_URL}:8080`,      catKey: 'LANTHANIDE', desc: 'Torrent client' },
    { label: 'SABNZBD',     sublabel: 'USENET',         url: `${PRIMARY_URL}:8085`,      catKey: 'LANTHANIDE', desc: 'Usenet client' },
    { label: 'MUSIC_PORTAL',sublabel: 'MUSICBRAINZ',    url: MUSIC_REQUEST_URL,          catKey: 'ACTINIDE',   desc: 'Music library' },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 h-full">
      <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-4 uppercase">
        {headerLabel || '◆ Quick_Launch ◆ Service_Portals'}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {buttons.map(btn => {
          const cat = activeCATRef.current[btn.catKey];
          return (
            <a
              key={btn.label}
              href={btn.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
              style={{
                display: 'flex', flexDirection: 'column',
                padding: '8px 10px', textDecoration: 'none',
                background: cat.bg, border: `1px solid ${cat.border}4D`,
                borderRadius: 6, cursor: 'pointer',
                boxShadow: `0 0 6px ${cat.glow}`,
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 14px ${cat.glow}`; e.currentTarget.style.background = cat.bg.replace(/[\d.]+\)$/, '0.14)'); }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 6px ${cat.glow}`;  e.currentTarget.style.background = cat.bg; }}
            >
              <div style={{ fontFamily: MONO, fontSize: 9, color: cat.text, letterSpacing: '0.18em' }}>{btn.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginTop: 1 }}>{btn.desc}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLaunchPanel;
