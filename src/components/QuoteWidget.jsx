import React from 'react';
import { MONO } from '../utils/constants.js';

const SECTION_STYLE = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '14px 16px',
};

const QuoteWidget = ({ quote, onRefresh, headerLabel, embedded }) => {
  const Wrapper = embedded ? 'div' : ({ children }) => <div style={SECTION_STYLE}>{children}</div>;
  return (
    <Wrapper>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.25em' }}>
          {headerLabel || '◆ DAILY_CATALYST ◆ ZenQuotes'}
        </span>
        <button
          onClick={onRefresh}
          disabled={quote.loading}
          style={{
            fontFamily: MONO, fontSize: 7, cursor: quote.loading ? 'default' : 'pointer',
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
            color: 'rgba(255,255,255,0.3)', padding: '1px 6px',
            opacity: quote.loading ? 0.4 : 1,
          }}
        >
          {quote.loading ? '...' : '↻ NEW'}
        </button>
      </div>

      {quote.error ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          FEED OFFLINE
        </div>
      ) : quote.loading ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          LOADING...
        </div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5, marginBottom: 6, fontStyle: 'italic' }}>
            "{quote.text}"
          </div>
          {quote.author && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.15em', textAlign: 'right' }}>
              — {quote.author.toUpperCase()}
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default QuoteWidget;
