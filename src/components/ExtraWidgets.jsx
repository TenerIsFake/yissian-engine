import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';

const MONO = 'monospace';

const CARD_STYLE = {
  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
  padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
};

const HEADER_STYLE = {
  fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em',
  // P2-10: raised from 0.4 → 0.70 for WCAG 2.1 AA compliance (~4.4:1 contrast ratio)
  color: 'rgba(255,255,255,0.70)', marginBottom: 2,
};

// ── 1. Lottery Widget ─────────────────────────────────────────────────────────
const POWERBALL_ODDS = [
  "Jackpot odds: 1 in 292,201,338",
  "Match 5 (no PB): 1 in 11,688,053.52",
  "Match 4 + PB: 1 in 913,129.18",
  "Match 4 (no PB): 1 in 36,525.17",
  "Match 3 + PB: 1 in 14,494.11",
  "Any prize: 1 in 24.87"
];
const MEGA_MILLIONS_ODDS = [
  "Jackpot odds: 1 in 302,575,350",
  "Match 5 (no MB): 1 in 12,607,306.25",
  "Match 4 + MB: 1 in 931,001",
  "Match 4 (no MB): 1 in 38,792",
  "Match 3 + MB: 1 in 14,547",
  "Any prize: 1 in 24"
];

export const LotteryWidget = ({ headerLabel }) => {
  const [pickCount, setPickCount] = useState(1);
  const [allPicks, setAllPicks] = useState([]);
  const [facts, setFacts] = useState([]);
  const [factIndex, setFactIndex] = useState(0);
  const [factsLoading, setFactsLoading] = useState(false);

  const generateNumbers = (type) => {
    const mainMax    = type === 'Powerball' ? 69 : 70;
    const specialMax = type === 'Powerball' ? 26 : 25;
    const mainNums = [];
    while (mainNums.length < 5) {
      const r = Math.floor(Math.random() * mainMax) + 1;
      if (!mainNums.includes(r)) mainNums.push(r);
    }
    mainNums.sort((a, b) => a - b);
    return { main: mainNums, special: Math.floor(Math.random() * specialMax) + 1 };
  };

  const generate = async (type) => {
    const picks = Array.from({ length: pickCount }, () => generateNumbers(type));
    setAllPicks(picks);
    setFactsLoading(true);
    const unique = [...new Set(picks.flatMap(p => p.main))];
    const fetched = await Promise.allSettled(
      unique.map(n => fetch(`http://numbersapi.com/${n}/math`).then(r => r.text()))
    );
    const numberFacts = fetched.filter(r => r.status === 'fulfilled').map(r => r.value);
    const oddsFacts = type === 'Powerball' ? POWERBALL_ODDS : MEGA_MILLIONS_ODDS;
    setFacts([...numberFacts, ...oddsFacts]);
    setFactIndex(0);
    setFactsLoading(false);
  };

  useEffect(() => {
    if (facts.length === 0) return;
    const t = setInterval(() => setFactIndex(i => (i + 1) % facts.length), 10000);
    return () => clearInterval(t);
  }, [facts]);

  return (
    <div style={CARD_STYLE}>
      <div style={HEADER_STYLE}>{headerLabel || '◆ LOTTERY_GENERATOR ◆ Random_Numbers'}</div>

      {/* Pick count selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>PICKS:</span>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setPickCount(n)} style={{
            width: 24, height: 24, borderRadius: 4,
            background: pickCount === n ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${pickCount === n ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: pickCount === n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
            fontFamily: MONO, fontSize: 10, cursor: 'pointer',
          }}>{n}</button>
        ))}
      </div>

      {/* Game buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['Powerball', 'Mega Millions'].map(t => (
          <button key={t} onClick={() => generate(t)} style={{
            flex: 1, padding: '7px 0', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
            color: 'rgba(255,255,255,0.75)', fontFamily: MONO, fontSize: 10,
            letterSpacing: '0.05em', cursor: 'pointer',
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Pick rows */}
      {allPicks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {allPicks.map((pick, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              {allPicks.length > 1 && (
                <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>
                  PICK {i + 1}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                {pick.main.map((n, j) => (
                  <span key={j} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.85)', fontFamily: MONO, fontSize: 11, fontWeight: 'bold',
                  }}>{n}</span>
                ))}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)',
                  color: '#fca5a5', fontFamily: MONO, fontSize: 11, fontWeight: 'bold',
                }}>{pick.special}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facts strip */}
      {(factsLoading || facts.length > 0) && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8,
          minHeight: 32, display: 'flex', alignItems: 'center',
        }}>
          {factsLoading ? (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
              LOADING_FACTS...
            </div>
          ) : (
            <div style={{
              fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.4, transition: 'opacity 0.5s ease',
              opacity: 1,
            }}>
              {facts[factIndex]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── 2. Stock Widget — NH-71: sparkline graphs + stock selector + period toggle ──

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'GC=F', 'SI=F', 'CL=F', '^GSPC', '^DJI', '^IXIC'];
const PERIODS = ['1d', '5d', '1mo', '3mo'];
const PERIOD_LABELS = { '1d': '1D', '5d': '5D', '1mo': '1M', '3mo': '3M' };
const MAX_SYMBOLS = 14;
const SYMBOL_LABELS = {
  'GC=F': 'GOLD', 'SI=F': 'SILVER', 'CL=F': 'CRUDE_OIL',
  '^GSPC': 'S&P_500', '^DJI': 'DOW_JONES', '^IXIC': 'NASDAQ',
};

const fmtCap = (n) => {
  if (!n) return null;
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
};

const Sparkline = ({ points, change, width = 120, height = 36 }) => {
  if (!points || points.length < 2) return null;
  const closes = points.map(p => p.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const coords = closes.map((c, i) =>
    `${(i / (closes.length - 1)) * width},${height - ((c - min) / range) * (height - 4) - 2}`
  ).join(' ');
  const color = change >= 0 ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)';
  const fillColor = change >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';
  const lastX = (closes.length - 1) / (closes.length - 1) * width;
  const lastY = height - ((closes[closes.length - 1] - min) / range) * (height - 4) - 2;
  const fillCoords = `0,${height} ${coords} ${lastX},${height}`;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polygon points={fillCoords} fill={fillColor} />
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
};

export const StockWidget = ({ headerLabel }) => {
  const [symbols, setSymbols] = useState(() => {
    try { return JSON.parse(localStorage.getItem('market-watch-symbols')) || DEFAULT_SYMBOLS; }
    catch { return DEFAULT_SYMBOLS; }
  });
  const [period, setPeriod] = useState(() => localStorage.getItem('market-watch-period') || '5d');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const fetchHistory = useCallback(() => {
    if (symbols.length === 0) { setLoading(false); return; }
    setLoading(true);
    const interval = period === '1d' ? '5m' : period === '5d' ? '1h' : '1d';
    fetch(`/api/flask/stocks/history?symbols=${symbols.join(',')}&period=${period}&interval=${interval}`)
      .then(r => r.json())
      .then(d => { if (!d.error) { setData(d); setLastUpdated(new Date()); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbols, period]);

  useEffect(() => {
    fetchHistory();
    const t = setInterval(fetchHistory, 300_000);
    return () => clearInterval(t);
  }, [fetchHistory]);

  useEffect(() => { localStorage.setItem('market-watch-symbols', JSON.stringify(symbols)); }, [symbols]);
  useEffect(() => { localStorage.setItem('market-watch-period', period); }, [period]);

  const addSymbol = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !symbols.includes(sym) && symbols.length < MAX_SYMBOLS) {
      setSymbols(prev => [...prev, sym]);
    }
    setNewSymbol('');
    setAdding(false);
  };

  const removeSymbol = (sym) => setSymbols(prev => prev.filter(s => s !== sym));

  return (
    <div style={CARD_STYLE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ ...HEADER_STYLE, flex: 1, marginBottom: 0 }}>{headerLabel || '◆ MARKET_WATCH ◆ Equities_&_Commodities'}</div>
        {symbols.length < MAX_SYMBOLS && (
          <button onClick={() => setAdding(v => !v)} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '2px 4px',
            display: 'flex', alignItems: 'center',
          }} aria-label="Add ticker">
            <Plus size={12} />
          </button>
        )}
      </div>

      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 4 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            fontFamily: MONO, fontSize: 7, letterSpacing: '0.1em', cursor: 'pointer',
            padding: '2px 8px', borderRadius: 3, border: '1px solid',
            borderColor: period === p ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
            background: period === p ? 'rgba(6,182,212,0.1)' : 'transparent',
            color: period === p ? '#38bdf8' : 'rgba(255,255,255,0.3)',
          }}>{PERIOD_LABELS[p]}</button>
        ))}
      </div>

      {/* Add ticker input */}
      {adding && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSymbol(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="TICKER"
            maxLength={6}
            autoFocus
            style={{
              flex: 1, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, padding: '4px 8px', color: 'rgba(255,255,255,0.8)',
              outline: 'none',
            }}
          />
          <button onClick={addSymbol} style={{
            fontFamily: MONO, fontSize: 8, padding: '4px 10px', borderRadius: 4,
            background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
            color: '#4ade80', cursor: 'pointer',
          }}>ADD</button>
        </div>
      )}

      {loading ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
          FETCHING_DATA...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {symbols.map(sym => {
            const s = data[sym];
            if (!s) return null;
            const label = SYMBOL_LABELS[sym] || sym;
            const r = s.ratios || {};
            return (
              <div key={sym} style={{
                padding: '6px 8px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', minWidth: 70 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                    ${s.current?.toFixed(2) ?? '—'}
                  </span>
                  <span style={{
                    fontFamily: MONO, fontSize: 10, fontWeight: 'bold',
                    color: (s.change ?? 0) >= 0 ? '#4ade80' : '#f87171',
                  }}>
                    {(s.change ?? 0) > 0 ? '+' : ''}{(s.change ?? 0).toFixed(2)}%
                  </span>
                  <button onClick={() => removeSymbol(sym)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.2)', padding: 2, display: 'flex', alignItems: 'center',
                  }} aria-label={`Remove ${sym}`}>
                    <X size={10} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Sparkline points={s.history} change={s.change ?? 0} width={140} height={36} />
                  {/* Investment ratios */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', flex: 1 }}>
                    {r.pe != null && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                        P/E <span style={{ color: 'rgba(255,255,255,0.55)' }}>{r.pe}</span>
                      </span>
                    )}
                    {r.divYield != null && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                        DIV <span style={{ color: '#4ade80' }}>{r.divYield}%</span>
                      </span>
                    )}
                    {r.beta != null && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                        β <span style={{ color: 'rgba(255,255,255,0.55)' }}>{r.beta}</span>
                      </span>
                    )}
                    {r.marketCap != null && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                        CAP <span style={{ color: 'rgba(255,255,255,0.55)' }}>{fmtCap(r.marketCap)}</span>
                      </span>
                    )}
                    {(r.w52Low != null || r.w52High != null) && (
                      <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>
                        52W <span style={{ color: 'rgba(255,255,255,0.45)' }}>{r.w52Low ?? '?'}–{r.w52High ?? '?'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastUpdated && !loading && (
        <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 6, marginTop: 2 }}>
          UPDATED: {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      )}
    </div>
  );
};

