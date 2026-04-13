import React from 'react';
import { MONO, safeHref } from '../utils/constants.js';

const SECTION_STYLE = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '14px 16px',
};

const WIKI_URL_RE = /^https:\/\/en\.wikipedia\.org\//;

const OnThisDayWidget = ({ history, headerLabel, embedded }) => {
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const Wrapper = embedded ? 'div' : ({ children }) => <div style={SECTION_STYLE}>{children}</div>;

  return (
    <Wrapper>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.25em', marginBottom: 8 }}>
        {headerLabel || '◆ TEMPORAL_DECAY ◆'} {dateLabel}
      </div>

      {history.error ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          FEED OFFLINE
        </div>
      ) : history.loading ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          LOADING...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4,
          maxHeight: 160, overflowY: 'auto' }}>
          {history.events.map((ev, i) => {
            const wikiPage = ev.pages?.[0];
            const wikiUrl = wikiPage?.content_urls?.desktop?.page;
            const validUrl = wikiUrl && WIKI_URL_RE.test(wikiUrl) ? wikiUrl : null;

            return (
              <div key={i} style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 9, lineHeight: 1.4 }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, minWidth: 36 }}>{ev.year}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {ev.text}
                  {validUrl && (
                    <a href={safeHref(validUrl)} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'rgba(100,180,255,0.5)', marginLeft: 4, textDecoration: 'none', fontSize: 8 }}>
                      ↗
                    </a>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Wrapper>
  );
};

export default OnThisDayWidget;
