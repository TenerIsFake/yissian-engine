import React from 'react';

/**
 * SCHLENK — PiraniTrace
 * Pirani vacuum gauge metaphor for bandwidth speedtest visualization.
 * Needle sweep indicates download speed; dial shows Mbps scale.
 * Prop surface matches SpeedtestSparkline (downloadMbps, uploadMbps, isStale).
 */
export default function PiraniTrace({ downloadMbps = 0, uploadMbps = 0, isStale = false }) {
  // Map 0-1000 Mbps to 0-180° needle sweep (logarithmic feel: log10 scale)
  const pctOf = (mbps) => {
    if (mbps <= 0) return 0;
    const logScale = Math.min(1, Math.log10(Math.max(1, mbps)) / Math.log10(1000));
    return logScale * 180;
  };
  const dlAngle = -90 + pctOf(downloadMbps);
  const ulAngle = -90 + pctOf(uploadMbps);
  const staleOpacity = isStale ? 0.45 : 1;

  return (
    <svg viewBox="0 0 140 90" style={{ width: '100%', height: '100%', display: 'block', opacity: staleOpacity }}>
      {/* Gauge body — brass ring (B warm) */}
      <circle cx="70" cy="60" r="42" fill="rgba(8,16,26,0.6)" stroke="#D4A04F" strokeWidth="1.5" />
      <circle cx="70" cy="60" r="38" fill="none" stroke="rgba(212,160,79,0.3)" strokeWidth="0.5" />
      {/* Scale arc (A cyan) */}
      <path d="M 32 60 A 38 38 0 0 1 108 60" fill="none" stroke="#4FB8D4" strokeWidth="0.8" />
      {/* Scale tick marks at 1, 10, 100, 1000 Mbps */}
      {[0, 45, 90, 135, 180].map((deg, i) => {
        const rad = (deg - 180) * Math.PI / 180;
        const x1 = 70 + 35 * Math.cos(rad);
        const y1 = 60 + 35 * Math.sin(rad);
        const x2 = 70 + 41 * Math.cos(rad);
        const y2 = 60 + 41 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4FB8D4" strokeWidth="0.8" />;
      })}
      {/* Needle DL (violet Ar accent) */}
      <g transform={`rotate(${dlAngle} 70 60)`}>
        <line x1="70" y1="60" x2="70" y2="24" stroke="#B47FE8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="24" r="1.5" fill="#B47FE8" />
      </g>
      {/* Needle UL (green N2 accent, thinner) */}
      <g transform={`rotate(${ulAngle} 70 60)`}>
        <line x1="70" y1="60" x2="70" y2="30" stroke="#5FD4A8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </g>
      {/* Center pivot */}
      <circle cx="70" cy="60" r="3" fill="#D4A04F" stroke="#8B6B2F" strokeWidth="0.5" />
      {/* Readout text */}
      <text x="70" y="78" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#B47FE8" fontWeight="bold">
        ↓ {downloadMbps.toFixed(0)}
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#5FD4A8">
        ↑ {uploadMbps.toFixed(0)} Mbps
      </text>
      {/* Scale labels */}
      <text x="32" y="72" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill="rgba(79,184,212,0.5)">0</text>
      <text x="108" y="72" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill="rgba(79,184,212,0.5)">1G</text>
      {isStale && (
        <text x="70" y="15" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#D4A04F" letterSpacing="0.2">
          STALE
        </text>
      )}
    </svg>
  );
}
