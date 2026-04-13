import React from 'react';

function TabbedTicker({ tabs }) {
  const [activeTab, setActiveTab] = React.useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 0 }}>
        {tabs.map((tab, i) => (
          <button key={tab.label} onClick={() => setActiveTab(i)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/60"
            style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
              padding: '6px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeTab === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              borderBottom: activeTab === i ? '2px solid rgba(100,200,255,0.7)' : '2px solid transparent' }}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[activeTab].content}
    </div>
  );
}

export default TabbedTicker;
