import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const MONO = 'monospace';

const CRON_LABELS = {
  '0 3 * * *':   'Daily 3am',
  '*/5 * * * *': 'Every 5min',
  '0 8 * * *':   'Daily 8am',
  '0 4 * * 0':   'Weekly Sun 4am',
  '0 */6 * * *': 'Every 6h',
};

function relativeTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function nextRelative(iso) {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `in ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h ${m % 60}m`;
  return `in ${Math.floor(h / 24)}d`;
}

export const CronMonitorWidget = () => {
  const [tab, setTab] = useState('schedule');
  const [collapsed, setCollapsed] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cron-status'],
    queryFn: async () => {
      const res = await fetch('/api/flask/cron/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const jobs = data?.jobs ?? [];

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>

      <button onClick={() => setCollapsed(v => !v)} aria-expanded={!collapsed}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ CRON_MONITOR ◆ {jobs.length} jobs
        </span>
        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 10 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {['schedule', 'recent runs'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
                padding: '2px 6px', borderRadius: 3, border: '1px solid',
                borderColor: tab === t ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
                background: tab === t ? 'rgba(6,182,212,0.08)' : 'transparent',
                color: tab === t ? '#38bdf8' : 'rgba(255,255,255,0.35)',
              }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {isLoading && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING…</div>}
          {isError  && <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>CRON_UNAVAILABLE</div>}

          {/* Schedule tab */}
          {tab === 'schedule' && !isLoading && !isError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 7,
                color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 2 }}>
                <span style={{ flex: 2 }}>JOB</span>
                <span style={{ flex: 2 }}>SCHEDULE</span>
                <span style={{ flex: 2 }}>NEXT RUN</span>
              </div>
              {jobs.map(j => (
                <div key={j.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
                    flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)', flex: 2 }}>
                    {CRON_LABELS[j.cron] ?? j.cron}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.5)', flex: 2 }}
                    title={j.next_run ?? ''}>
                    {nextRelative(j.next_run)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Runs tab */}
          {tab === 'recent runs' && !isLoading && !isError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 7,
                color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 2 }}>
                <span style={{ flex: 2 }}>JOB</span>
                <span style={{ flex: 2 }}>LAST RUN</span>
                <span style={{ flex: 1 }}>NOTE</span>
              </div>
              {jobs.map(j => (
                <div key={j.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.7)',
                    flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 7, flex: 2,
                    color: j.last_run ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                    title={j.last_run ?? ''}>
                    {relativeTime(j.last_run)}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 7, flex: 1,
                    color: j.restart_count != null ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {j.restart_count != null ? `restarts:${j.restart_count}` : (j.last_line ? '✓' : '—')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CronMonitorWidget;
