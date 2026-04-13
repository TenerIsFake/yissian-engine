import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const MONO = 'monospace';
const SPOTIFY_PLAYLIST_ID = '37i9dQZF1EJt2dhYzpWj7z';

const SpotifyMiniPlayer = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: collapsed ? '4px 16px' : '6px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      transition: 'padding 0.2s ease',
    }}>
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', padding: 2, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
        aria-label={collapsed ? 'Expand player' : 'Collapse player'}
      >
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {collapsed ? (
        <span style={{
          fontFamily: MONO, fontSize: 8, letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.3)',
        }}>
          ♫ SERVER_SOUNDTRACK
        </span>
      ) : (
        <div style={{ flex: 1, minWidth: 0 }}>
          <iframe
            style={{ borderRadius: 8, border: 'none', display: 'block' }}
            src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0&auto_play=1`}
            width="100%"
            height="80"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="lazy"
            title="Spotify Mini Player"
          />
        </div>
      )}
    </div>
  );
};

export default SpotifyMiniPlayer;
