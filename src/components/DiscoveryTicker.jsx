import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Tv, Disc } from 'lucide-react';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const DiscoveryTicker = ({ items, label, sublabel, accentColor = 'indigo', type = 'film' }) => {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);

  const accentMap = {
    amber:  { dot: '#f59e0b', card: 'from-amber-500/20 to-amber-900/40 border-amber-500/30', icon: <Film size={11} className="text-amber-400" />, typeLabel: 'COMPOUND' },
    blue:   { dot: '#3b82f6', card: 'from-blue-500/20 to-blue-900/40 border-blue-500/30',   icon: <Tv   size={11} className="text-blue-400"  />, typeLabel: 'REACTION' },
    purple: { dot: '#a855f7', card: 'from-purple-500/20 to-purple-900/40 border-purple-500/30', icon: <Disc size={11} className="text-purple-400" />, typeLabel: 'ISOTOPE' },
  };
  const accent = accentMap[accentColor] ?? accentMap.amber;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const tick = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        pos += 0.6;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items]);

  const getRelative = (ts) => {
    const diff = Date.now() / 1000 - ts;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getItemUrl = (item) => {
    if (type === 'film'   && item.tmdbId) return `https://www.themoviedb.org/movie/${item.tmdbId}`;
    if (type === 'series' && item.tvdbId) return `https://www.thetvdb.com/dereferrer/series/${item.tvdbId}`;
    if (type === 'music'  && item.mbid)   return `https://musicbrainz.org/release/${item.mbid}`;
    return null;
  };

  const display = items.length > 0
    ? [...items, ...items]
    : Array.from({ length: 8 }, (_, i) => ({ id: `sk-${i}`, skeleton: true }));

  return (
    <div className="rounded-xl border border-white/10 backdrop-blur-md bg-black/40 shadow-2xl overflow-hidden transition-all duration-500">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b text-[9px] tracking-[0.25em] uppercase border-white/10 text-white/35 bg-white/5">
        <span className="w-1.5 h-1.5 rounded-full motion-safe:animate-pulse" style={{ background: accent.dot }} />
        {label} ◆ {sublabel}
      </div>
      <div className="p-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden pb-2"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {display.map((item, idx) => {
            if (item.skeleton) return (
              <div key={`${item.id}-${idx}`} className="flex-shrink-0 w-32 h-44 rounded-lg bg-white/5 border border-white/5 motion-safe:animate-pulse" />
            );
            const isPlexThumb = (t) =>
              typeof t === 'string' &&
              t.startsWith('/library/') &&
              !t.includes('://') &&
              !t.includes('%2f') &&
              !t.includes('%2F');
            const thumbUrl = item.thumb && isPlexThumb(item.thumb)
              ? `/api/plex/photo/:/transcode?width=200&height=280&url=${encodeURIComponent(item.thumb)}`
              : null;
            const itemUrl = getItemUrl(item);
            return (
              <motion.div
                key={`${item.ratingKey}-${idx}`}
                whileHover={itemUrl ? { scale: 1.04, y: -3 } : {}}
                className={`flex-shrink-0 w-32 h-44 rounded-lg border bg-gradient-to-t ${accent.card} overflow-hidden relative group ${itemUrl ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {thumbUrl && (
                  <img src={thumbUrl} alt={`${item.title} ${type === 'music' ? 'album art' : 'poster'}`} loading="lazy" onError={e => e.currentTarget.style.display = 'none'} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {itemUrl && (
                  <a href={itemUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`Open ${item.title} in external database`}>
                    <span className="absolute top-1.5 right-1.5 text-white/0 group-hover:text-white/60 transition-colors text-[10px] leading-none select-none">↗</span>
                  </a>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                  <div className="flex items-center gap-1 mb-0.5 opacity-70">
                    {accent.icon}
                    <span className="text-[8px] font-mono uppercase tracking-wider">{accent.typeLabel}</span>
                  </div>
                  <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.title}</p>
                  {item.addedAt && (
                    <p className="text-white/40 text-[8px] font-mono mt-0.5">discovered {getRelative(item.addedAt)}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTicker;
