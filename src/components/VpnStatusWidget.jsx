import React from 'react';

const MONO = 'monospace';

export const VpnStatusWidget = ({ protonvpnStats, vpnForwardedPort, qbitListenPort }) => {
  const country  = protonvpnStats?.details?.find(d => d.label === 'COUNTRY')?.value ?? '—';
  const ip       = protonvpnStats?.details?.find(d => d.label === 'EXIT_IP')?.value ?? '—';
  const online   = protonvpnStats?.online;
  const portMatch = vpnForwardedPort !== null && qbitListenPort !== null
    ? vpnForwardedPort === qbitListenPort
    : null;

  const vpnOk = online === true;
  const statusColor = vpnOk ? '#22c55e' : online === null ? '#f59e0b' : '#ef4444';
  const statusLabel = vpnOk ? 'TUNNEL_ACTIVE' : online === null ? 'CONNECTING' : 'TUNNEL_DOWN';

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 h-full">
      <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-3 uppercase">
        ◆ VPN_STATUS ◆ ProtonVPN·Gluetun
      </div>

      {/* Main status */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: statusColor, letterSpacing: '0.15em' }}>{statusLabel}</span>
      </div>

      {/* Data rows */}
      <div className="space-y-1">
        <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 9 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>COUNTRY</span>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{country}</span>
        </div>
        <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 9 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>EXIT_IP</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>{ip}</span>
        </div>
        <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 9 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>FWD_PORT</span>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{vpnForwardedPort ?? '—'}</span>
        </div>
        <div className="flex justify-between items-center" style={{ fontFamily: MONO, fontSize: 9, marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>PORT_SYNC</span>
          {portMatch === null ? (
            <span style={{ color: '#f59e0b' }}>UNKNOWN</span>
          ) : portMatch ? (
            <span style={{ color: '#22c55e' }}>IN_SYNC ✓</span>
          ) : (
            <span style={{ color: '#ef4444', animation: 'pulse 1s infinite' }}>MISMATCH ✗ ({vpnForwardedPort}≠{qbitListenPort})</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VpnStatusWidget;
