import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MONO = 'monospace';

export const DnsLeakCard = () => {
  const qc = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ['dns-leak'],
    queryFn: () => fetch('/api/flask/vpn/leaktest').then(r => r.json()),
    refetchInterval: 1_800_000,  // 30 min
    staleTime: 1_800_000,
  });

  const refresh = async () => {
    await fetch('/api/flask/vpn/leaktest/refresh', { method: 'POST' });
    qc.invalidateQueries({ queryKey: ['dns-leak'] });
  };

  const passed      = data?.passed;
  const gluetunUp   = data?.gluetun_up;
  const hasError    = !!data?.error;

  const dotColor = isFetching   ? '#f59e0b'
    : hasError                  ? '#f59e0b'
    : gluetunUp === false       ? '#ef4444'   // Gluetun down
    : passed                    ? '#22c55e'   // qBit behind ProtonVPN
    : passed === false          ? '#ef4444'   // exit IP not ProtonVPN
    : '#6b7280';                              // no data yet

  const label = isFetching      ? 'CHECKING…'
    : hasError                  ? 'GLUETUN_UNREACHABLE'
    : gluetunUp === false       ? 'VPN_DOWN — QBIT EXPOSED'
    : passed                    ? `PROTECTED — ${data.outgoing_asn?.split(' ')[0] ?? 'ProtonVPN'}`
    : passed === false          ? `LEAK — ${data.outgoing_asn ?? 'non-VPN exit'}`
    : 'UNKNOWN';

  const checkedAt = data?.checked_at
    ? new Date(data.checked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 h-full">
      <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 mb-3 uppercase">
        ◆ QBIT_VPN ◆ Gluetun·Integrity
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor,
          boxShadow: `0 0 8px ${dotColor}`, flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: dotColor, letterSpacing: '0.1em' }}>
          {label}
        </span>
      </div>

      {/* Data rows */}
      <div className="space-y-1">
        {data?.outgoing_ip && (
          <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 9 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>VPN_EXIT_IP</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{data.outgoing_ip}</span>
          </div>
        )}
        {data?.outgoing_asn && (
          <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 9 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>ASN</span>
            <span style={{ color: passed ? 'rgba(74,222,128,0.9)' : '#f87171', maxWidth: '55%',
              textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.outgoing_asn}
            </span>
          </div>
        )}
        {checkedAt && (
          <div className="flex justify-between" style={{ fontFamily: MONO, fontSize: 8,
            marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>LAST_CHECK</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>
              {data.cached ? '(cached) ' : ''}{checkedAt}
            </span>
          </div>
        )}
      </div>

      {/* Check Now button */}
      <div className="mt-3">
        <button onClick={refresh} disabled={isFetching} style={{
          fontFamily: MONO, fontSize: 8, cursor: isFetching ? 'wait' : 'pointer',
          padding: '3px 10px', borderRadius: 3,
          border: '1px solid rgba(6,182,212,0.35)',
          background: 'rgba(6,182,212,0.08)', color: '#38bdf8',
          opacity: isFetching ? 0.5 : 1,
        }}>
          {isFetching ? '…' : '↻ CHECK NOW'}
        </button>
      </div>
    </div>
  );
};

export default DnsLeakCard;
