import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PlexEcosystemRow from './PlexEcosystemRow.jsx';
import { apiFetch } from '../utils/apiClient.js';

const MONO = 'monospace';

const STAGE_COLORS = {
  requested:   '#f39c12',
  downloading: '#3498db',
  completed:   '#2ecc71',
};
const STAGE_ICONS = { requested: '⏳', downloading: '⬇', completed: '✓' };

// ── Inline SVG horizontal bar chart ──────────────────────────────────────
const BarChart = ({ data, valueKey = 'total_plays', labelKey = 'title' }) => {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 8, width: 110, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.7)' }}>
            {item[labelKey] ?? '—'}
          </span>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 10 }}>
            <div style={{
              width: `${((item[valueKey] ?? 0) / max) * 100}%`,
              background: 'rgba(6,182,212,0.6)', height: '100%', borderRadius: 2,
            }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', width: 28, textAlign: 'right' }}>
            {item[valueKey] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Downloads tab content (qBit + SABnzbd) ───────────────────────────────
const DownloadsTab = ({ qbTorrents, sabnzbdQueue }) => {
  const torrents = qbTorrents ?? [];
  const slots = sabnzbdQueue?.slots ?? [];
  const speed = sabnzbdQueue?.speed ?? '0';
  const timeleft = sabnzbdQueue?.timeleft ?? '0:00:00';

  if (torrents.length === 0 && slots.length === 0) {
    return <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>NO_ACTIVE_DOWNLOADS</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {torrents.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 4 }}>
            QBITTORRENT — {torrents.length} active
          </div>
          {torrents.map((t, i) => {
            const pct = t.size > 0 ? Math.round((1 - t.amount_left / t.size) * 100) : 0;
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
                    maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{pct}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: 'rgba(52,152,219,0.7)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {slots.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 4 }}>
            SABNZBD — {speed} · {timeleft}
          </div>
          {slots.map((s, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.6)', marginBottom: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.filename ?? s.name ?? '—'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Reading tab sub-components ────────────────────────────────────────────
const ReadingTab = () => {
  const [readingView, setReadingView] = useState('inprogress');
  const [searchQ, setSearchQ] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  const { data: inProgressData, isFetching: ipFetching } = useQuery({
    queryKey: ['reading-inprogress'],
    queryFn: () => fetch('/api/flask/reading/inprogress').then(r => r.json()),
    refetchInterval: 10 * 60 * 1000,
    enabled: readingView === 'inprogress',
  });
  const { data: recentData, isFetching: recFetching } = useQuery({
    queryKey: ['reading-recent'],
    queryFn: () => fetch('/api/flask/reading/recent').then(r => r.json()),
    refetchInterval: 10 * 60 * 1000,
    enabled: readingView === 'recent',
  });
  const { data: searchData, isFetching: searchFetching } = useQuery({
    queryKey: ['reading-search', searchTrigger],
    queryFn: () => fetch(`/api/flask/reading/search?q=${encodeURIComponent(searchTrigger)}`).then(r => r.json()),
    enabled: !!searchTrigger,
    staleTime: 60_000,
  });

  const SERVICE_COLOR = { audiobookshelf: '#f59e0b', kavita: '#a855f7', hardcover: '#22c55e' };

  const ServiceBadge = ({ service }) => (
    <span style={{ fontFamily: 'monospace', fontSize: 6, padding: '0 4px', borderRadius: 3,
      background: `${SERVICE_COLOR[service] ?? '#6b7280'}22`,
      border: `1px solid ${SERVICE_COLOR[service] ?? '#6b7280'}55`,
      color: SERVICE_COLOR[service] ?? '#9ca3af', letterSpacing: '0.05em', flexShrink: 0 }}>
      {service}
    </span>
  );

  const inProgress = inProgressData?.items ?? [];
  const recent     = recentData?.items ?? [];
  const searchResults = searchData?.items ?? [];

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[['inprogress', 'IN PROGRESS'], ['recent', 'RECENTLY ADDED'], ['search', 'SEARCH']].map(([v, label]) => (
          <button key={v} onClick={() => setReadingView(v)} style={{
            fontFamily: 'monospace', fontSize: 7, cursor: 'pointer', padding: '2px 7px', borderRadius: 3,
            border: '1px solid',
            borderColor: readingView === v ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)',
            background: readingView === v ? 'rgba(168,85,247,0.1)' : 'transparent',
            color: readingView === v ? '#c084fc' : 'rgba(255,255,255,0.35)',
          }}>{label}</button>
        ))}
        {(ipFetching || recFetching || searchFetching) && (
          <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>…</span>
        )}
      </div>

      {/* In Progress */}
      {readingView === 'inprogress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {inProgress.length === 0 && !ipFetching && (
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>NO_ITEMS_IN_PROGRESS</div>
          )}
          {inProgress.map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <ServiceBadge service={item.service} />
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.75)', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</a> : item.title}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                  {item.progress_pct}%
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 3 }}>
                <div style={{ width: `${item.progress_pct}%`, height: '100%', borderRadius: 2,
                  background: `${SERVICE_COLOR[item.service] ?? '#6b7280'}99` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently Added — cover grid */}
      {readingView === 'recent' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {recent.length === 0 && !recFetching && (
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>NO_RECENT_ITEMS</div>
          )}
          {recent.map((item, i) => (
            <a key={i} href={item.url || '#'} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
                width: 72, flexShrink: 0 }}>
              <div style={{ width: 72, height: 96, borderRadius: 4, overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {item.cover_url
                  ? <img src={item.cover_url} alt="" loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>
                      {item.type?.[0]?.toUpperCase() ?? '?'}
                    </div>
                }
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.6)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                display: 'block', maxWidth: 72 }}>{item.title}</span>
              <ServiceBadge service={item.service} />
            </a>
          ))}
        </div>
      )}

      {/* Search */}
      {readingView === 'search' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchTrigger(searchQ)}
              placeholder="Search books, manga, audiobooks…"
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 3, padding: '4px 8px', color: 'rgba(255,255,255,0.8)', outline: 'none' }} />
            <button onClick={() => setSearchTrigger(searchQ)} disabled={!searchQ.trim()} style={{
              fontFamily: 'monospace', fontSize: 8, cursor: 'pointer',
              padding: '3px 8px', borderRadius: 3,
              border: '1px solid rgba(168,85,247,0.4)',
              background: 'rgba(168,85,247,0.1)', color: '#c084fc',
              opacity: searchQ.trim() ? 1 : 0.4,
            }}>GO</button>
          </div>
          {searchFetching && <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>SEARCHING…</div>}
          {!searchFetching && searchTrigger && searchResults.length === 0 && (
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>NO_RESULTS</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {searchResults.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ServiceBadge service={item.service} />
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.75)', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</a> : item.title}
                </span>
                {item.author && <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.35)',
                  flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.author}
                </span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main widget ───────────────────────────────────────────────────────────
export const MediaPipelineWidget = ({ qbTorrents, sabnzbdQueue, addLog, widgetLabels }) => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [pipelineCount, setPipelineCount] = useState(
    parseInt(localStorage.getItem('pipeline-item-count') || '5', 10)
  );
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const qc = useQueryClient();

  const updateCount = (n) => {
    const c = Math.max(1, Math.min(10, n));
    setPipelineCount(c);
    localStorage.setItem('pipeline-item-count', String(c));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'analytics') setAnalyticsEnabled(true);
  };

  const { data: pipelineData, refetch: refetchPipeline } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => apiFetch('/api/flask/pipeline'),
    refetchInterval: 60_000,
    onError: (e) => addLog?.('PIPELINE', `Fetch failed: ${e.message}`, 'warn'),
  });

  const { data: analyticsData, isFetching: analyticsFetching } = useQuery({
    queryKey: ['tautulli-analytics', analyticsPeriod],
    queryFn: () => apiFetch(`/api/tautulli/analytics?period=${analyticsPeriod}`),
    enabled: analyticsEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const approve = async (id) => {
    await fetch(`/api/flask/overseerr/request/${id}/approve`, { method: 'POST' });
    refetchPipeline();
  };
  const deny = async (id) => {
    await fetch(`/api/flask/overseerr/request/${id}/decline`, { method: 'POST' });
    refetchPipeline();
  };

  const items = (pipelineData?.items ?? []).slice(0, pipelineCount);
  const TABS = ['pipeline', 'downloads', 'plex', 'analytics', 'reading'];

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => handleTabChange(tab)} style={{
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
            padding: '3px 8px', borderRadius: 3, border: '1px solid',
            borderColor: activeTab === tab ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
            background: activeTab === tab ? 'rgba(6,182,212,0.1)' : 'transparent',
            color: activeTab === tab ? '#38bdf8' : 'rgba(255,255,255,0.4)',
          }}>{tab.toUpperCase()}</button>
        ))}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <button onClick={() => updateCount(pipelineCount - 1)} style={{ fontFamily: MONO, fontSize: 10,
              background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '1px 5px' }}>−</button>
            <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{pipelineCount}</span>
            <button onClick={() => updateCount(pipelineCount + 1)} style={{ fontFamily: MONO, fontSize: 10,
              background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '1px 5px' }}>+</button>
          </div>
        )}
        <button onClick={() => refetchPipeline()} style={{ fontFamily: MONO, fontSize: 10,
          background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '1px 6px', marginLeft: activeTab !== 'pipeline' ? 'auto' : undefined }}>↻</button>
      </div>

      {/* Pipeline tab */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>PIPELINE_EMPTY</div>
          )}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden="true" style={{ fontSize: 10, flexShrink: 0 }}>{STAGE_ICONS[item.stage] ?? '◆'}</span>
              <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
                background: `${STAGE_COLORS[item.stage] ?? '#888'}22`,
                border: `1px solid ${STAGE_COLORS[item.stage] ?? '#888'}55`,
                color: STAGE_COLORS[item.stage] ?? '#888', letterSpacing: '0.05em' }}>
                {item.stage_label ?? item.stage}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.75)', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{item.type}</span>
              {item.stage === 'requested' && item.overseerr_id && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => approve(item.overseerr_id)} style={{
                    fontFamily: MONO, fontSize: 7, cursor: 'pointer', padding: '1px 5px', borderRadius: 3,
                    border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: '#4ade80',
                  }}>✓</button>
                  <button onClick={() => deny(item.overseerr_id)} style={{
                    fontFamily: MONO, fontSize: 7, cursor: 'pointer', padding: '1px 5px', borderRadius: 3,
                    border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#f87171',
                  }}>✗</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Downloads tab */}
      {activeTab === 'downloads' && (
        <DownloadsTab qbTorrents={qbTorrents} sabnzbdQueue={sabnzbdQueue} />
      )}

      {/* Plex tab */}
      {activeTab === 'plex' && <PlexEcosystemRow addLog={addLog} widgetLabels={widgetLabels} />}

      {/* Reading tab (DF-10) */}
      {activeTab === 'reading' && <ReadingTab />}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['day', 'week'].map(p => (
              <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{
                fontFamily: MONO, fontSize: 8, cursor: 'pointer', padding: '2px 8px', borderRadius: 3,
                border: '1px solid',
                borderColor: analyticsPeriod === p ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
                background: analyticsPeriod === p ? 'rgba(6,182,212,0.08)' : 'transparent',
                color: analyticsPeriod === p ? '#38bdf8' : 'rgba(255,255,255,0.35)',
              }}>{p.toUpperCase()}</button>
            ))}
            {analyticsFetching && <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>…</span>}
          </div>
          {!analyticsData && !analyticsFetching && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>LOADING_ANALYTICS…</div>
          )}
          {analyticsData?.error && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>TAUTULLI_UNAVAILABLE</div>
          )}
          {analyticsData && !analyticsData.error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(analyticsData.top_movies?.length > 0) && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 6 }}>TOP MOVIES</div>
                  <BarChart data={analyticsData.top_movies} labelKey="title" valueKey="total_plays" />
                </div>
              )}
              {(analyticsData.top_tv?.length > 0) && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 6 }}>TOP TV</div>
                  <BarChart data={analyticsData.top_tv} labelKey="title" valueKey="total_plays" />
                </div>
              )}
              {(analyticsData.top_users?.length > 0) && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 6 }}>TOP USERS</div>
                  <BarChart data={analyticsData.top_users} labelKey="friendly_name" valueKey="total_plays" />
                </div>
              )}
              {(analyticsData.library_counts?.length > 0) && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 6 }}>LIBRARY SIZES</div>
                  <BarChart data={analyticsData.library_counts} labelKey="name" valueKey="count" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaPipelineWidget;
