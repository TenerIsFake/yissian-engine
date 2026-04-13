import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MONO = 'monospace';

export const VpnStatusWidget = ({ protonvpnStats, vpnForwardedPort, qbitListenPort, headerLabel, dnsLeakLabel }) => {
  const qc = useQueryClient();

  const country  = protonvpnStats?.details?.find(d => d.label === 'COUNTRY')?.value ?? '—';
  const ip       = protonvpnStats?.details?.find(d => d.label === 'EXIT_IP')?.value ?? '—';
  const online   = protonvpnStats?.online;
  const portMatch = vpnForwardedPort !== null && qbitListenPort !== null
    ? vpnForwardedPort === qbitListenPort
    : null;

  const vpnOk = online === true;
  const statusColor = vpnOk ? '#22c55e' : online === null ? '#f59e0b' : '#ef4444';
  const statusLabel = vpnOk ? 'TUNNEL_ACTIVE' : online === null ? 'CONNECTING' : 'TUNNEL_DOWN';

  /* ── DNS Leak data ── */
  const { data: leakData, isFetching: leakFetching } = useQuery({
    queryKey: ['dns-leak'],
    queryFn: () => fetch('/api/flask/vpn/leaktest').then(r => r.json()),
    refetchInterval: 1_800_000,
    staleTime: 1_800_000,
  });

  const refreshLeak = async () => {
    await fetch('/api/flask/vpn/leaktest/refresh', { method: 'POST' });
    qc.invalidateQueries({ queryKey: ['dns-leak'] });
  };

  const leakPassed    = leakData?.passed;
  const gluetunUp     = leakData?.gluetun_up;
  const hasLeakError  = !!leakData?.error;

  const leakDotColor = leakFetching ? '#f59e0b'
    : hasLeakError          ? '#f59e0b'
    : gluetunUp === false   ? '#ef4444'
    : leakPassed            ? '#22c55e'
    : leakPassed === false  ? '#ef4444'
    : '#6b7280';

  const leakLabel = leakFetching      ? 'CHECKING…'
    : hasLeakError                    ? 'GLUETUN_UNREACHABLE'
    : gluetunUp === false             ? 'VPN_DOWN — QBIT EXPOSED'
    : leakPassed                      ? `PROTECTED — ${leakData.outgoing_asn?.split(' ')[0] ?? 'ProtonVPN'}`
    : leakPassed === false            ? `LEAK — ${leakData.outgoing_asn ?? 'non-VPN exit'}`
    : 'UNKNOWN';

  const leakCheckedAt = leakData?.checked_at
    ? new Date(leakData.checked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 h-full">
      <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-3 uppercase">
        {headerLabel || '◆ VPN_STATUS ◆ ProtonVPN·Gluetun'}
      </div>

      {/* Main status */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: statusColor, letterSpacing: '0.15em' }}>{statusLabel}</span>
      </div>

      {/* VPN data rows */}
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

      {/* ── DNS Leak / Integrity (bottom half) ── */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-[8px] font-mono tracking-[0.2em] text-white/25 mb-2 uppercase">
          {dnsLeakLabel || 'QBIT_VPN ◆ Gluetun·Integrity'}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: leakDotColor,
            boxShadow: `0 0 6px ${leakDotColor}`, flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: 9, color: leakDotColor, letterSpacing: '0.1em' }}>
            {leakLabel}
          </span>
        </div>

        <div className="space-y-1">
          {leakData?.outgoing_ip && (
            <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>VPN_EXIT_IP</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{leakData.outgoing_ip}</span>
            </div>
          )}
          {leakData?.outgoing_asn && (
            <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ASN</span>
              <span style={{ color: leakPassed ? 'rgba(74,222,128,0.9)' : '#f87171', maxWidth: '55%',
                textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leakData.outgoing_asn}
              </span>
            </div>
          )}
          {leakCheckedAt && (
            <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 7,
              marginTop: 2, paddingTop: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>LAST_CHECK</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                {leakData.cached ? '(cached) ' : ''}{leakCheckedAt}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2">
          <button onClick={refreshLeak} disabled={leakFetching} style={{
            fontFamily: MONO, fontSize: 7, cursor: leakFetching ? 'wait' : 'pointer',
            padding: '2px 8px', borderRadius: 3,
            border: '1px solid rgba(6,182,212,0.35)',
            background: 'rgba(6,182,212,0.08)', color: '#38bdf8',
            opacity: leakFetching ? 0.5 : 1,
          }}>
            {leakFetching ? '…' : '↻ CHECK NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VpnStatusWidget;
