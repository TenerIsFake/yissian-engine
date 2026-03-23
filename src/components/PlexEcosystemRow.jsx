import React from 'react';
import { useQuery } from '@tanstack/react-query';

const MONO = 'monospace';

const PlexLibraryStatsWidget = ({ data, isLoading }) => {
  const { movies = 0, shows = 0, albums = 0 } = data || {};
  if (isLoading) return <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: 16 }}>LOADING...</div>;
  const cols = [
    { label: 'MOVIES',  value: movies,  color: '#fb923c', icon: '[FILM]' },
    { label: 'SHOWS',   value: shows,   color: '#38bdf8', icon: '[TV]' },
    { label: 'ALBUMS',  value: albums,  color: '#a855f7', icon: '[ALBUM]' },
  ];
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
        ◆ LIBRARY_STATS ◆ Plex_Counts
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {cols.map(({ label, value, color, icon }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, padding: '10px 6px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em', color, marginBottom: 2 }}>{icon}</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 300,
              color, lineHeight: 1, textShadow: `0 0 12px ${color}66` }}>
              {value > 0 ? value.toLocaleString() : '—'}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlexLiveSessionsWidget = ({ data, isLoading }) => {
  const [hoverThumb, setHoverThumb] = React.useState(null);  // { idx, url, x, y }

  const sessions = data?.sessions || [];
  const mediaEmoji = (type) => {
    if (type === 'movie')   return '🎬';
    if (type === 'episode') return '📺';
    if (type === 'track')   return '🎵';
    return '▶';
  };
  const fmt = (ms) => {
    if (!ms || ms === 0) return '0:00';
    return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
  };
  const isTranscode = (s) => s.stream_video_decision === 'transcode' || s.stream_audio_decision === 'transcode';
  const transcodeDetail = (s) => {
    const parts = [];
    if (s.video_codec && s.stream_video_codec) parts.push(`video: ${s.video_codec} → ${s.stream_video_decision === 'transcode' ? s.stream_video_codec : 'copy'}`);
    if (s.audio_codec && s.stream_audio_codec) parts.push(`audio: ${s.audio_codec} → ${s.stream_audio_decision === 'transcode' ? s.stream_audio_codec : 'copy'}`);
    if (s.subtitle_decision) parts.push(`subs: ${s.subtitle_decision}`);
    return parts.join(', ');
  };

  const fetchThumb = async (thumbPath, idx, e) => {
    if (!thumbPath) return;
    try {
      const res = await fetch(`/api/flask/tautulli/thumb?img=${encodeURIComponent(thumbPath)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverThumb({ idx, url, x: rect.right + 8, y: rect.top });
    } catch { /* ignore */ }
  };

  if (isLoading) return <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: 16 }}>LOADING...</div>;

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
        ◆ LIVE_SESSIONS ◆ Plex_Active_Streams
        {data?.stream_count > 0 && (
          <span style={{ marginLeft: 8, color: '#22c55e', fontSize: 8 }}>[{data.stream_count}]</span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.15em', textAlign: 'center', padding: '12px 0' }}>
          NO_ACTIVE_SESSIONS
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
          {sessions.map((s, i) => {
            const tc = isTranscode(s);
            const isLive = !s.duration || s.duration === 0;
            const pct = isLive ? 100 : Math.min(100, Math.round((s.view_offset / s.duration) * 100) || 0);
            const epLabel = s.media_type === 'episode' && s.parent_media_index && s.media_index
              ? ` S${String(s.parent_media_index).padStart(2,'0')}E${String(s.media_index).padStart(2,'0')}` : '';
            return (
              <div key={i}
                onMouseEnter={(e) => fetchThumb(s.grandparent_thumb || s.thumb, i, e)}
                onMouseLeave={() => { if (hoverThumb?.idx === i) { URL.revokeObjectURL(hoverThumb.url); setHoverThumb(null); } }}
                style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
                  display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>{mediaEmoji(s.media_type)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.85)',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}{epLabel}
                  </span>
                  <span style={{
                    fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em',
                    padding: '2px 5px', borderRadius: 3, flexShrink: 0,
                    background: tc ? 'rgba(251,146,60,0.15)' : 'rgba(34,197,94,0.15)',
                    border: `1px solid ${tc ? 'rgba(251,146,60,0.4)' : 'rgba(34,197,94,0.4)'}`,
                    color: tc ? '#fb923c' : '#22c55e',
                  }}>
                    {tc ? 'TRANSCODE' : 'DIRECT'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
                    {s.user} · {s.player}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                    {isLive ? 'LIVE' : `${fmt(s.view_offset)} / ${fmt(s.duration)}`}
                    {s.bitrate ? ` · ${(s.bitrate / 1000).toFixed(1)}Mbps` : ''}
                  </span>
                </div>
                {!isLive && (
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(6,182,212,0.6)', borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                )}
                {tc && (
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(251,146,60,0.6)', letterSpacing: '0.05em' }}>
                    {transcodeDetail(s)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Poster hover tooltip */}
      {hoverThumb && (
        <div style={{
          position: 'fixed', left: Math.min(hoverThumb.x, window.innerWidth - 100), top: hoverThumb.y,
          zIndex: 2000, pointerEvents: 'none',
        }}>
          <img src={hoverThumb.url} alt="" style={{ width: 80, height: 120, borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} />
        </div>
      )}
    </div>
  );
};

const PlexOnDeckWidget = ({ data, isLoading }) => {
  const items = data || [];
  if (isLoading) return <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: 16 }}>LOADING...</div>;

  const mediaLabel = (type) => {
    if (type === 'movie')   return 'MOVIE';
    if (type === 'episode') return 'EPISODE';
    return type?.toUpperCase() ?? 'MEDIA';
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
        ◆ ON_DECK ◆ Plex_In_Progress
      </div>
      {items.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>NO_ITEMS_IN_PROGRESS</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => {
            const pct = item.duration > 0 ? Math.round((item.viewOffset / item.duration) * 100) : 0;
            const title = item.grandparentTitle ? `${item.grandparentTitle} — ${item.title}` : item.title;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.75)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{title}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{mediaLabel(item.type)} · {pct}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(6,182,212,0.6)', borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PlexEcosystemRow = ({ addLog }) => {
  const libQuery = useQuery({
    queryKey: ['plex-library'],
    queryFn: async () => {
      const [movRes, showRes, albRes] = await Promise.allSettled([
        fetch('/api/plex/library/sections/1/all?type=1&X-Plex-Container-Size=0&X-Plex-Container-Start=0', { headers: { Accept: 'application/json' } }),
        fetch('/api/plex/library/sections/2/all?type=2&X-Plex-Container-Size=0&X-Plex-Container-Start=0', { headers: { Accept: 'application/json' } }),
        fetch('/api/plex/library/sections/8/all?type=9&X-Plex-Container-Size=0&X-Plex-Container-Start=0', { headers: { Accept: 'application/json' } }),
      ]);
      const parseCount = async (res) => {
        if (res.status !== 'fulfilled' || !res.value.ok) return 0;
        const d = await res.value.json();
        return d?.MediaContainer?.size ?? 0;
      };
      const [movies, shows, albums] = await Promise.all([
        parseCount(movRes), parseCount(showRes), parseCount(albRes),
      ]);
      return { movies, shows, albums };
    },
    refetchInterval: 300_000,
    onSuccess: (data) => {
      if (addLog) addLog('PLEX-STATS', `Library: ${data.movies} movies, ${data.shows} shows, ${data.albums} albums`, 'info');
    },
    onError: (err) => { if (addLog) addLog('PLEX-STATS', `Stats fetch failed: ${err.message}`, 'warn'); },
  });

  const liveQuery = useQuery({
    queryKey: ['plex-live-sessions'],
    queryFn: async () => {
      const res = await fetch('/api/flask/tautulli/sessions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 15_000,
    onError: (err) => { if (addLog) addLog('PLEX-LIVE', `Sessions fetch failed: ${err.message}`, 'warn'); },
  });

  const onDeckQuery = useQuery({
    queryKey: ['plex-ondeck'],
    queryFn: async () => {
      const res = await fetch('/api/plex/library/onDeck?X-Plex-Container-Size=5', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data?.MediaContainer?.Metadata ?? []).slice(0, 5).map(m => ({
        title:            typeof m.title            === 'string' ? m.title.slice(0, 100)           : '',
        grandparentTitle: typeof m.grandparentTitle === 'string' ? m.grandparentTitle.slice(0, 80) : '',
        type:             typeof m.type             === 'string' ? m.type                           : '',
        viewOffset:       typeof m.viewOffset       === 'number' ? m.viewOffset                     : 0,
        duration:         typeof m.duration         === 'number' ? m.duration                       : 0,
      }));
    },
    refetchInterval: 300_000,
    onSuccess: (data) => {
      if (addLog) addLog('PLEX-ONDECK', `On Deck: ${data.length} items`, 'info');
    },
    onError: (err) => { if (addLog) addLog('PLEX-ONDECK', `On Deck fetch failed: ${err.message}`, 'warn'); },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PlexLibraryStatsWidget data={libQuery.data} isLoading={libQuery.isLoading} />
      <PlexOnDeckWidget data={onDeckQuery.data} isLoading={onDeckQuery.isLoading} />
      <PlexLiveSessionsWidget data={liveQuery.data} isLoading={liveQuery.isLoading} />
    </div>
  );
};

export default PlexEcosystemRow;
