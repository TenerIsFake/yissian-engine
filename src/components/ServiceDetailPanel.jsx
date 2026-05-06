import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { activeCATRef } from '../themes/ThemeContext.jsx';
import { getStatusTier, SECTION_LABEL_STYLE, safeHref, PRIMARY_URL, MONO } from '../utils/constants.js';
import StatusDot from './StatusDot.jsx';
import ContainerProfile from './ContainerProfile.jsx';

// ─────────────────────────────────────────────
// SERVICE DETAIL PANEL — unified panel for all modes + bots
// ─────────────────────────────────────────────

// ── Shared inline styles (P2-14 DRY extraction) ──
const S = {
  sectionDivider: { marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 },
  sectionHeader: (size = 10) => ({ fontFamily: MONO, fontSize: size, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em' }),
  flexRow: (gap = 6, mb = 0) => ({ display: 'flex', gap, ...(mb ? { marginBottom: mb } : {}) }),
  pillBtn: (active, color = '6,182,212') => ({
    fontFamily: MONO, fontSize: 7, cursor: 'pointer',
    padding: '2px 6px', borderRadius: 3, border: '1px solid',
    borderColor: active ? `rgba(${color},0.5)` : 'rgba(255,255,255,0.1)',
    background: active ? `rgba(${color},0.1)` : 'transparent',
    color: active ? `rgba(${color},1)` : 'rgba(255,255,255,0.35)',
  }),
  actionBtn: (color = '6,182,212') => ({
    fontFamily: MONO, fontSize: 8, cursor: 'pointer',
    padding: '4px 10px', borderRadius: 3,
    border: `1px solid rgba(${color},0.4)`,
    background: `rgba(${color},0.1)`, color: `rgb(${color})`,
  }),
  dimText: (size = 11) => ({ fontSize: size, color: 'rgba(255,255,255,0.5)' }),
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 12 },
};

// ── Service-specific sections (extracted from old ElementDetailPanel) ──

const ClaudeTerminalSection = ({ stats }) => {
  const ct = stats._terminal || {};
  const [selHost, setSelHost] = useState('srv1');
  const getVal = (host, key, def) => localStorage.getItem(`claude-terminal-${host}-${key}`) ?? def;
  const setVal = (host, key, val) => localStorage.setItem(`claude-terminal-${host}-${key}`, val);
  const [backend, setBackend] = useState(getVal(selHost, 'backend', 'clsh'));
  const [mode, setMode] = useState(getVal(selHost, 'mode', 'claude'));

  const switchBackend = (b) => {
    setVal(selHost, 'backend', b); setBackend(b);
    const ep = selHost === 'srv1' ? '/api/claude-terminal/backend' : '/api/claude-terminal-srv2/backend';
    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backend: b }) });
  };
  const switchMode = (m) => {
    setVal(selHost, 'mode', m); setMode(m);
    const ep = selHost === 'srv1' ? '/api/claude-terminal/mode' : '/api/claude-terminal-srv2/mode';
    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: m }) });
  };
  const openTerminal = () => {
    const prefix = selHost === 'srv1' ? '/terminal/' : '/terminal/srv2/';
    window.open(`${prefix}${backend}/`, '_blank');
  };
  const showQR = async () => {
    const ep = selHost === 'srv1' ? '/api/claude-terminal/qr' : '/api/claude-terminal-srv2/qr';
    const data = await fetch(ep).then(r => r.json());
    if (data.found) window.open(data.url, '_blank');
  };

  return (
    <div style={S.sectionDivider}>
      <div style={S.flexRow(6, 8)}>
        {[['srv1', 'SRV-1', ct.srv1Online], ['srv2', 'SRV-2', ct.srv2Online]].map(([h, label, online]) => (
          <button key={h} onClick={() => setSelHost(h)} style={{
            ...S.pillBtn(selHost === h, '6,182,212'), fontSize: 8, letterSpacing: '0.1em', padding: '3px 8px',
          }}>
            {label} <span style={{ color: online ? '#4ade80' : '#f87171' }}>●</span>
          </button>
        ))}
      </div>
      <div style={S.flexRow(6, 4)}>
        {['clsh', 'ttyd'].map(b => (
          <button key={b} onClick={() => switchBackend(b)} style={S.pillBtn(backend === b, '168,85,247')}>
            {b.toUpperCase()}
          </button>
        ))}
        {backend === 'ttyd' && ['claude', 'bash'].map(m => (
          <button key={m} onClick={() => switchMode(m)} style={S.pillBtn(mode === m, '74,222,128')}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button onClick={openTerminal} style={S.actionBtn('6,182,212')}>⎋ OPEN TERMINAL</button>
        {backend === 'clsh' && (
          <button onClick={showQR} style={S.actionBtn('255,255,255')}>📱 QR</button>
        )}
      </div>
    </div>
  );
};

const HueBridgeSection = ({ stats }) => {
  const d = stats._hue;
  if (!d) return null;
  const toggle = async (key) => {
    await fetch('/api/hue/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
  };
  return (
    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[['automation_enabled', 'AUTOMATION'], ['music_enabled', 'MUSIC']].map(([key, label]) => (
          <button key={key} onClick={() => toggle(key)} style={{
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', cursor: 'pointer',
            padding: '3px 8px', borderRadius: 3, border: '1px solid',
            borderColor: d[key] ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)',
            background: d[key] ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
            color: d[key] ? '#4ade80' : 'rgba(255,255,255,0.4)',
          }}>{label}: {d[key] ? 'ON' : 'OFF'}</button>
        ))}
      </div>
      {(d.rooms || []).map(r => (
        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, paddingTop: 2, fontFamily: MONO }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r.name}</span>
          <span style={{ color: r.lights_on ? '#fde047' : 'rgba(255,255,255,0.2)' }}>
            {r.lights_on ? `💡 ${r.brightness_pct}%` : 'OFF'}
          </span>
        </div>
      ))}
    </div>
  );
};

const CloudflaredSection = ({ stats }) => {
  const cf = stats._cf;
  if (!cf) return null;
  const { connections = [], auth } = cf;
  return (
    <>
      {connections.length > 0 && (
        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>ACTIVE CONNECTORS</div>
          {connections.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', paddingTop: 2, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO }}>{c.colo || '—'}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: MONO }}>{c.origin_ip || '—'}</span>
            </div>
          ))}
        </div>
      )}
      {auth && (
        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>LAST AUTH EVENT</div>
          {auth.available && auth.last_event ? (
            <>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontFamily: MONO, wordBreak: 'break-all' }}>
                {auth.last_event.user_email || '—'}
              </div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {auth.last_event.created_at || ''}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              {auth.reason || 'No auth events'}
            </div>
          )}
        </div>
      )}
    </>
  );
};

const TautulliBridgeSection = ({ element }) => {
  const { data: tbHistory } = useQuery({
    queryKey: ['tb-history'],
    queryFn: () => fetch('/api/tautulli-bridge/api/history').then(r => r.json()),
    refetchInterval: 30_000,
    enabled: !!element,
  });
  const { data: tbDevices } = useQuery({
    queryKey: ['tb-devices'],
    queryFn: () => fetch('/api/tautulli-bridge/api/devices').then(r => r.json()),
    enabled: !!element,
    staleTime: 60_000,
  });
  const { data: tbVoices } = useQuery({
    queryKey: ['tb-voices'],
    queryFn: () => fetch('/api/tautulli-bridge/api/voices').then(r => r.json()),
    enabled: !!element,
    staleTime: 300_000,
  });
  const [castText, setCastText] = useState('');
  const [castDevice, setCastDevice] = useState('');
  const [castVoice, setCastVoice] = useState('');
  const [casting, setCasting] = useState(false);
  const [castResult, setCastResult] = useState(null);

  const doCast = async () => {
    if (!castText.trim()) return;
    setCasting(true); setCastResult(null);
    try {
      const r = await fetch('/api/tautulli-bridge/api/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: castText.trim(),
          // Explicit: targeted device, OR opt-in broadcast to test targets.
          // Empty device_name without broadcast:true is a 400 (TB-01 guard).
          ...(castDevice ? { device_name: castDevice } : { broadcast: true }),
          ...(castVoice ? { voice: castVoice } : {}),
        }),
      });
      const d = await r.json();
      setCastResult(r.ok ? `QUEUED → ${d.device}` : `ERROR: ${d.error}`);
      if (r.ok) setCastText('');
    } catch (e) {
      setCastResult(`ERROR: ${e.message}`);
    } finally {
      setCasting(false);
    }
  };

  const history = Array.isArray(tbHistory) ? tbHistory : [];
  const devices = Array.isArray(tbDevices) ? tbDevices : [];
  const voices = tbVoices?.voices || [];
  const currentVoice = tbVoices?.current || '';

  const selectStyle = { fontFamily: MONO, fontSize: 8, background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
    padding: '4px 6px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' };

  return (
    <div style={S.sectionDivider}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>RECENT ANNOUNCEMENTS</div>
      {history.length === 0 ? (
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: MONO, marginBottom: 8 }}>NO_HISTORY</div>
      ) : (
        <div style={{ marginBottom: 8, maxHeight: 80, overflowY: 'auto' }}>
          {history.slice(0, 6).map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 8, fontFamily: MONO, paddingBottom: 3,
              borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 3 }}>
              <span style={{ color: h.success ? '#4ade80' : '#f87171', flexShrink: 0, marginRight: 6 }}>
                {h.success ? '✓' : '✗'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: 6 }}>
                {h.device_name}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>CAST NOW</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <input
          value={castText}
          onChange={e => setCastText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doCast()}
          placeholder="Announce text…"
          style={{ flex: '1 1 120px', fontFamily: MONO, fontSize: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 3, padding: '4px 8px', color: 'rgba(255,255,255,0.8)',
            outline: 'none' }}
        />
        {devices.length > 0 && (
          <select value={castDevice} onChange={e => setCastDevice(e.target.value)} style={selectStyle}>
            <option value="">default</option>
            {devices.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        )}
        <button onClick={doCast} disabled={casting || !castText.trim()} style={{
          fontFamily: MONO, fontSize: 8, cursor: casting ? 'wait' : 'pointer',
          padding: '4px 10px', borderRadius: 3,
          border: '1px solid rgba(6,182,212,0.4)',
          background: 'rgba(6,182,212,0.1)', color: '#38bdf8',
          opacity: (!castText.trim() || casting) ? 0.4 : 1,
        }}>{casting ? '…' : '▶ CAST'}</button>
      </div>
      {voices.length > 0 && (
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: MONO, letterSpacing: '0.15em', flexShrink: 0 }}>VOICE</span>
          <select value={castVoice} onChange={e => setCastVoice(e.target.value)}
            style={{ ...selectStyle, flex: 1, maxWidth: 260 }}>
            <option value="">{currentVoice || 'default'}</option>
            {voices.map(v => (
              <option key={v.short_name} value={v.short_name}>
                {v.short_name.replace('Microsoft Server Speech Text to Speech Voice ', '')} ({v.gender})
              </option>
            ))}
          </select>
        </div>
      )}
      {castResult && (
        <div style={{ marginTop: 4, fontSize: 8, fontFamily: MONO,
          color: castResult.startsWith('ERROR') ? '#f87171' : '#4ade80' }}>
          {castResult}
        </div>
      )}
    </div>
  );
};

// ── Lottery Section ──

const POWERBALL_ODDS = [
  { match: 'Jackpot (5 + PB)',  odds: '1 in 292,201,338' },
  { match: '5 (no PB)',         odds: '1 in 11,688,054' },
  { match: '4 + PB',            odds: '1 in 913,129' },
  { match: '4 (no PB)',         odds: '1 in 36,525' },
  { match: '3 + PB',            odds: '1 in 14,494' },
  { match: 'Any prize',         odds: '1 in 24.87' },
];
const MEGA_ODDS = [
  { match: 'Jackpot (5 + MB)',  odds: '1 in 302,575,350' },
  { match: '5 (no MB)',         odds: '1 in 12,607,306' },
  { match: '4 + MB',            odds: '1 in 931,001' },
  { match: '4 (no MB)',         odds: '1 in 38,792' },
  { match: '3 + MB',            odds: '1 in 14,547' },
  { match: 'Any prize',         odds: '1 in 24' },
];

const LotterySection = () => {
  const [game, setGame] = useState('powerball');
  const [tab, setTab] = useState('trends');   // trends | generate | odds
  const [trendWindow, setTrendWindow] = useState('10');
  const [pickCount, setPickCount] = useState(1);
  const [picks, setPicks] = useState([]);

  const { data: trends, isLoading } = useQuery({
    queryKey: ['lottery-trends', game],
    queryFn: () => fetch(`/api/flask/lottery/trends?game=${game}`).then(r => r.json()),
    refetchInterval: 3_600_000,
    staleTime: 1_800_000,
  });

  const generate = () => {
    const mainMax = game === 'powerball' ? 69 : 70;
    const specialMax = game === 'powerball' ? 26 : 25;
    const newPicks = Array.from({ length: pickCount }, () => {
      const main = [];
      while (main.length < 5) {
        const r = Math.floor(Math.random() * mainMax) + 1;
        if (!main.includes(r)) main.push(r);
      }
      main.sort((a, b) => a - b);
      return { main, special: Math.floor(Math.random() * specialMax) + 1 };
    });
    setPicks(newPicks);
  };

  const trendData = trends?.trends?.[trendWindow];
  const odds = game === 'powerball' ? POWERBALL_ODDS : MEGA_ODDS;

  return (
    <div style={S.sectionDivider}>
      {/* Game selector */}
      <div style={S.flexRow(6, 6)}>
        {[['powerball', 'POWERBALL'], ['megamillions', 'MEGA MILLIONS']].map(([g, label]) => (
          <button key={g} onClick={() => { setGame(g); setPicks([]); }} style={S.pillBtn(game === g, game === g ? '239,68,68' : '6,182,212')}>
            {label}
          </button>
        ))}
      </div>

      {/* Next draw */}
      {trends?.next_draw && (
        <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          NEXT DRAW: <span style={{ color: '#fde047' }}>{trends.next_draw}</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={S.flexRow(4, 6)}>
        {[['trends', 'TRENDS'], ['generate', 'GENERATE'], ['odds', 'ODDS']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={S.pillBtn(tab === t, '6,182,212')}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TRENDS tab ── */}
      {tab === 'trends' && (
        <div>
          <div style={S.flexRow(4, 6)}>
            {['10', '25', '50'].map(w => (
              <button key={w} onClick={() => setTrendWindow(w)} style={S.pillBtn(trendWindow === w, '168,85,247')}>
                LAST {w}
              </button>
            ))}
          </div>
          {isLoading && <div style={S.dimText(8)}>LOADING...</div>}
          {!isLoading && trendData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontFamily: MONO, fontSize: 8 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>HOT NUMBERS</div>
              <div style={{ color: '#4ade80' }}>{trendData.hot_numbers?.join(', ')}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>COLD NUMBERS</div>
              <div style={{ color: '#f87171' }}>{trendData.cold_numbers?.join(', ')}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>HOT SPECIAL</div>
              <div style={{ color: '#fde047' }}>{trendData.hot_special?.join(', ')}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>AVG SUM</div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{trendData.avg_sum}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>AVG NUMBER</div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{trendData.avg_number}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>ODD:EVEN</div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{trendData.odd_even}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>HIGH:LOW</div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{trendData.high_low}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)' }}>DATE RANGE</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 7 }}>{trendData.date_range}</div>
            </div>
          )}
          {!isLoading && trends?.error && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: '#f87171' }}>{trends.error}</div>
          )}
        </div>
      )}

      {/* ── GENERATE tab ── */}
      {tab === 'generate' && (
        <div>
          <div style={{ ...S.flexRow(6, 6), alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>PICKS:</span>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setPickCount(n)} style={{
                width: 22, height: 22, borderRadius: 3, fontFamily: MONO, fontSize: 9, cursor: 'pointer',
                background: pickCount === n ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${pickCount === n ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: pickCount === n ? '#fff' : 'rgba(255,255,255,0.45)',
              }}>{n}</button>
            ))}
            <button onClick={generate} style={S.actionBtn('74,222,128')}>GENERATE</button>
          </div>
          {picks.map((pick, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              {picks.length > 1 && (
                <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.25)', width: 14 }}>#{i + 1}</span>
              )}
              {pick.main.map((n, j) => (
                <span key={j} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: '50%', fontFamily: MONO, fontSize: 10, fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                }}>{n}</span>
              ))}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '50%', fontFamily: MONO, fontSize: 10, fontWeight: 'bold',
                background: game === 'powerball' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)',
                border: `1px solid ${game === 'powerball' ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.5)'}`,
                color: game === 'powerball' ? '#fca5a5' : '#fde68a',
              }}>{pick.special}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ODDS tab ── */}
      {tab === 'odds' && (
        <div style={{ fontFamily: MONO, fontSize: 8 }}>
          {odds.map((o, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{o.match}</span>
              <span style={{ color: i === 0 ? '#fde047' : 'rgba(255,255,255,0.7)' }}>{o.odds}</span>
            </div>
          ))}
          {trends?.latest && (
            <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>LAST DRAWN ({trends.latest.date})</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {trends.latest.main.map((n, i) => (
                  <span key={i} style={{ color: 'rgba(255,255,255,0.7)' }}>{n}</span>
                ))}
                <span style={{ color: game === 'powerball' ? '#fca5a5' : '#fde68a' }}>+{trends.latest.special}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QueueManagerSection = ({ stats }) => {
  const d = stats.details || [];
  const getVal = (label) => (d.find(x => x.label === label) || {}).value || '—';
  const state    = getVal('STATE');
  const progress = getVal('PROGRESS');
  const lastRun  = getVal('LAST RUN');

  const [searched, total] = progress.split(' / ').map(s => parseInt(s, 10) || 0);
  const pct = total > 0 ? Math.round(searched / total * 100) : 0;

  const stateColor = state === 'ACTIVE'  ? '#4ade80'
                   : state === 'DONE'    ? '#60a5fa'
                   : state === 'PAUSED'  ? '#facc15'
                   : 'rgba(255,255,255,0.3)';

  return (
    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>
        UPGRADE SCHEDULER
      </div>

      {/* State badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stateColor, flexShrink: 0,
          boxShadow: `0 0 6px ${stateColor}` }} />
        <span style={{ fontSize: 9, fontFamily: MONO, color: stateColor, letterSpacing: '0.15em' }}>
          {state}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8,
          color: 'rgba(255,255,255,0.4)', fontFamily: MONO, marginBottom: 3 }}>
          <span>SERIES SEARCHED</span>
          <span>{progress}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2,
            background: state === 'DONE' ? '#60a5fa' : '#4ade80',
            transition: 'width 0.6s ease',
            boxShadow: `0 0 8px ${state === 'DONE' ? '#60a5fa' : '#4ade80'}55` }} />
        </div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: MONO, marginTop: 2, textAlign: 'right' }}>
          {pct}%
        </div>
      </div>

      {/* Last run */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8,
        color: 'rgba(255,255,255,0.35)', fontFamily: MONO }}>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>LAST RUN</span>
        <span>{lastRun}</span>
      </div>
    </div>
  );
};

const HomePlannerSection = () => (
  <div style={S.sectionDivider}>
    <div style={{ ...S.sectionHeader(), marginBottom: 8 }}>◆ FLOOR PLAN ◆</div>
    <iframe
      src="/api/homeplanner/"
      title="HomePlanner 3D"
      style={{ width: '100%', minHeight: 480, border: 'none', borderRadius: 6, background: '#0a0a0f' }}
      loading="lazy"
    />
    <div style={{ marginTop: 10, textAlign: 'right' }}>
      <a
        href="http://10.0.0.155:3100"
        target="_blank"
        rel="noreferrer"
        style={{ ...S.actionBtn('168,85,247'), textDecoration: 'none', display: 'inline-block' }}
      >
        ↗ OPEN HOMEPLANNER
      </a>
    </div>
  </div>
);

const SERVICE_SECTIONS = {
  'claude-terminal': ClaudeTerminalSection,
  'hue-bridge': HueBridgeSection,
  'cloudflared': CloudflaredSection,
  'tautulli-bridge': TautulliBridgeSection,
  'lottery': LotterySection,
  'queue-manager': QueueManagerSection,
  'homeplanner': HomePlannerSection,
};

// ── Default detailTransform (CHEM fallback) ──

const defaultHeaderIcon = ({ cat, online }) => (
  <div style={{ fontSize: 48, fontWeight: 700, color: cat.text, textShadow: `0 0 20px ${cat.glow}`, lineHeight: 1 }} />
);

export const defaultDetailTransform = (element) => ({
  title: (element.name || element.service || '').toUpperCase(),
  subtitle: element.symbol || '',
  categoryLabel: '',
  metadata: [],
  statusLabels: ['GROUND', 'EXCITED', 'METASTABLE', 'NUCLEAR_DECAY'],
  serviceLinkColor: 'rgba(100,200,255,0.8)',
});

// ── Bot layout ──

const PLEX_BASE = `${PRIMARY_URL}:32400`;

const BotLayout = ({ bot, result, cat, onClose }) => {
  const [requestStatus, setRequestStatus] = useState({});

  const handleRequest = async (item) => {
    setRequestStatus(s => ({ ...s, [item.tmdb_id]: 'loading' }));
    try {
      const r = await fetch('/api/seerr/api/v1/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: item.metadata?.media_type || 'movie',
          mediaId: item.tmdb_id,
        }),
      });
      setRequestStatus(s => ({ ...s, [item.tmdb_id]: r.ok ? 'done' : 'error' }));
    } catch {
      setRequestStatus(s => ({ ...s, [item.tmdb_id]: 'error' }));
    }
  };

  const items = result?.items ?? [];

  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: MONO }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em' }}>
            GROUP_{bot.group} ◆ BOT_{bot.z}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: cat.text, textShadow: `0 0 12px ${cat.glow}` }}>
              {bot.symbol}
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{bot.bot_name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{bot.desc}</div>
            </div>
          </div>
          {result && (
            <div style={{ marginTop: 6, fontSize: 11, color: cat.text }}>
              {result.load_label} {result.cached ? '· cached' : ''}
            </div>
          )}
        </div>
        <button onClick={onClose} aria-label="Close bot panel" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60" style={S.closeBtn}>
          <X size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
          {result?.online === false ? 'Bot offline' : 'No results yet — polling…'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.04)', borderRadius: 4,
              padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {item.poster_path && typeof item.poster_path === 'string' && item.poster_path.startsWith('https://') && (
                <img src={item.poster_path} alt="" style={{ width: 36, height: 54, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title} {item.year ? <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>({item.year})</span> : null}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{item.reason}</div>
              </div>
              {item.plex_key && (
                <button
                  aria-label={`Open ${item.title} in Plex`}
                  onClick={() => window.open(`${PLEX_BASE}/web/#!/server/details?key=${encodeURIComponent(item.plex_key)}`, '_blank')}
                  style={{
                    fontSize: 10, padding: '4px 8px', borderRadius: 3,
                    background: 'rgba(229,160,13,0.15)', border: '1px solid rgba(229,160,13,0.4)',
                    color: '#e5a00d', cursor: 'pointer', flexShrink: 0, fontFamily: MONO,
                  }}
                >PLEX</button>
              )}
              {!item.plex_key && item.tmdb_id && (
                <button
                  aria-label={`Request ${item.title}`}
                  onClick={() => handleRequest(item)}
                  disabled={requestStatus[item.tmdb_id] === 'done' || requestStatus[item.tmdb_id] === 'loading'}
                  style={{
                    fontSize: 10, padding: '4px 8px', borderRadius: 3,
                    background: requestStatus[item.tmdb_id] === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(162,155,254,0.15)',
                    border: `1px solid ${requestStatus[item.tmdb_id] === 'done' ? 'rgba(34,197,94,0.4)' : 'rgba(162,155,254,0.4)'}`,
                    color: requestStatus[item.tmdb_id] === 'done' ? '#22c55e' : '#a29bfe',
                    cursor: requestStatus[item.tmdb_id] ? 'default' : 'pointer',
                    opacity: requestStatus[item.tmdb_id] === 'loading' ? 0.6 : 1,
                    flexShrink: 0, fontFamily: MONO,
                  }}
                >
                  {requestStatus[item.tmdb_id] === 'done' ? 'SENT' :
                   requestStatus[item.tmdb_id] === 'loading' ? '↺' :
                   requestStatus[item.tmdb_id] === 'error' ? 'ERR' : 'REQUEST'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main panel ──

const ServiceDetailPanel = ({ element, stats, onClose, detailTransform, bot, botResult }) => {
  const isBot = !!bot && !element;
  const target = element || bot;
  const cat = target ? (activeCATRef.current[target.cat] ?? activeCATRef.current.TRANSITION) : null;
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [target, onClose]);

  useEffect(() => {
    if (target) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [target]);

  useEffect(() => {
    if (isBot) return; // bot panel uses overlay instead of inert
    const main = document.querySelector('main');
    if (!main) return;
    if (target) main.setAttribute('inert', ''); else main.removeAttribute('inert');
    return () => main.removeAttribute('inert');
  }, [target, isBot]);

  // Bot layout — separate visual treatment
  if (isBot) {
    return (
      <AnimatePresence>
        {bot && (
          <>
            <motion.div
              key="bot-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
              onClick={onClose}
            />
            <motion.div
              key="bot-panel"
              ref={panelRef}
              tabIndex={-1}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                maxHeight: '65vh', overflowY: 'auto',
                background: 'rgba(15,17,23,0.97)',
                borderTop: `2px solid ${cat.border}`,
                backdropFilter: 'blur(16px)',
                outline: 'none',
              }}
            >
              <BotLayout bot={bot} result={botResult} cat={cat} onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // No element selected — nothing to render
  if (!element) return null;

  // Service layout — detailTransform drives the left column
  const transform = detailTransform
    ? detailTransform(element, stats)
    : defaultDetailTransform(element, stats);
  const status = getStatusTier(stats.level);

  // Override status label from transform
  if (status && transform.statusLabels) {
    status.label = transform.statusLabels[status.tier] ?? status.label;
  }

  const HeaderIcon = transform.HeaderIcon;
  const linkColor = transform.serviceLinkColor || 'rgba(100,200,255,0.8)';
  const ServiceSection = element ? SERVICE_SECTIONS[element.id] : null;

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          key="service-detail-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-0 left-0 right-0 z-40 font-mono"
          style={{ background: '#0D0F14', borderTop: `2px solid ${cat.border}`, maxHeight: '38vh', outline: 'none' }}
        >
          <div className="max-w-screen-2xl mx-auto px-6 py-4 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                {/* Header visual — mode-specific icon or default symbol */}
                {HeaderIcon
                  ? <HeaderIcon cat={cat} online={stats.online} level={stats.level} />
                  : <div style={{ fontSize: 48, fontWeight: 700, color: cat.text, textShadow: `0 0 20px ${cat.glow}`, lineHeight: 1 }}>
                      {transform.headerSymbol || element.symbol}
                    </div>
                }
                <div>
                  <div style={{ fontSize: 11, color: cat.text, letterSpacing: '0.2em' }}>{transform.title}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>{transform.subtitle}</div>
                  {transform.categoryLabel && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.1em' }}>{transform.categoryLabel}</div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                className="text-white/30 hover:text-white/70 transition-colors mt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Mode-specific metadata */}
              <div className="space-y-2">
                {transform.metadata.map((row, i) => (
                  <React.Fragment key={i}>
                    <div style={{ ...SECTION_LABEL_STYLE, marginBottom: i === 0 ? 6 : 4, marginTop: i > 0 ? 8 : 0 }}>{row.label}</div>
                    <div style={{ fontSize: row.fontSize || 12, color: row.color || cat.text }}>{row.value}</div>
                  </React.Fragment>
                ))}
                {status && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ ...SECTION_LABEL_STYLE }}>CURRENT_STATE: </span>
                    <span style={{ fontSize: 9, color: status.tier > 0 ? status.glowColor : cat.text }}>{status.label}</span>
                  </div>
                )}
              </div>

              {/* Right: Service telemetry (shared across all modes) */}
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>SERVICE_TELEMETRY ◆ {element.service}</div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  {(() => {
                    const _statusColor = stats.online ? '#22c55e' : stats.stale ? '#6366f1' : stats.online === null ? '#f59e0b' : '#ef4444';
                    const _statusLabel = stats.online ? 'ONLINE' : stats.stale ? 'STALE' : stats.online === null ? 'STARTING' : 'OFFLINE';
                    return (
                      <>
                        <StatusDot online={stats.online} stale={stats.stale} size={8} />
                        <span style={{ fontSize: 9, color: _statusColor }}>{_statusLabel}</span>
                      </>
                    );
                  })()}
                </div>
                {safeHref(element.url) ? (
                  <a href={safeHref(element.url)} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', textAlign: 'center',
                      fontFamily: MONO, fontSize: 10, letterSpacing: 2,
                      color: linkColor, border: `1px solid ${linkColor}44`,
                      padding: '8px 0', marginTop: 8, textDecoration: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = `${linkColor}14`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    OPEN SERVICE UI →
                  </a>
                ) : (
                  <div style={{ display: 'block', width: '100%', textAlign: 'center',
                    fontFamily: MONO, fontSize: 10, letterSpacing: 2,
                    color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 0', marginTop: 8 }}>
                    NO_UI_AVAILABLE
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: status && status.tier > 0 ? status.glowColor : cat.border, borderRadius: 2 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {stats.details?.map((d) => (
                  <div key={d.label} className="flex justify-between" style={{ fontSize: 9, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{d.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{d.value}</span>
                  </div>
                ))}
                {ServiceSection && <ServiceSection element={element} stats={stats} />}
                <ContainerProfile elementId={element?.id} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailPanel;
