import React from 'react';

const LiveClock = () => {
  const [clockTime, setClockTime] = React.useState(
    () => new Date().toLocaleTimeString('en-US', { hour12: false })
  );
  React.useEffect(() => {
    const t = setInterval(
      () => setClockTime(new Date().toLocaleTimeString('en-US', { hour12: false })),
      1000
    );
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)',
      letterSpacing: '0.12em', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
      padding: '4px 8px' }}>
      {clockTime}
    </span>
  );
};

export default LiveClock;
