import React, { useState, useEffect } from 'react';

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

// NH-13: Replace with your personal Spotify playlist ID
const SPOTIFY_PLAYLIST_ID = '37i9dQZF1EJt2dhYzpWj7z';

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

export const LotteryWidget = () => {
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
      <div style={HEADER_STYLE}>◆ LOTTERY_GENERATOR ◆ Random_Numbers</div>

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

// ── 2. Stock Widget — NH-09: auto-refresh every 5 min + last-updated footer ──
export const StockWidget = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStocks = () => {
    setLoading(true);
    fetch('/api/flask/stocks')
      .then(r => r.json())
      .then(data => {
        setStocks(data);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // NH-09: fetch on mount + auto-refresh every 5 minutes
  useEffect(() => {
    fetchStocks();
    const t = setInterval(fetchStocks, 300_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={CARD_STYLE}>
      <div style={HEADER_STYLE}>◆ MARKET_WATCH ◆ Live_Equities</div>
      {loading ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
          FETCHING_DATA...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stocks.map((s) => (
            <div key={s.ticker} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 8px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>
                {s.ticker}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                ${s.price.toFixed(2)}
              </span>
              <span style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 'bold',
                color: s.change >= 0 ? '#4ade80' : '#f87171',
              }}>
                {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
      {/* NH-09: last-updated footer */}
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

// ── 3. Spotify Widget — NH-13: playlist ID extracted to named constant ──────
export const SpotifyWidget = () => (
  <div style={CARD_STYLE}>
    <div style={HEADER_STYLE}>◆ SERVER_SOUNDTRACK ◆ Spotify_Feed</div>
    <iframe
      style={{ borderRadius: 8, border: 'none', display: 'block' }}
      src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`}
      width="100%" height="152"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-popups"
      loading="lazy"
      title="Spotify Player"
    />
  </div>
);
