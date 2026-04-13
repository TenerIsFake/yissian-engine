import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X } from 'lucide-react';
import ChatWidget from './ChatWidget.jsx';

const MONO = 'monospace';

const ChatBubble = () => {
  const [open, setOpen] = useState(false);

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  return createPortal(
    <>
      {/* Expanded chat panel */}
      {open && (
        <>
          {/* Backdrop (mobile: full screen, desktop: subtle) */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />

          <div style={{
            position: 'fixed',
            zIndex: 1000,
            // Mobile: full screen with margins
            bottom: window.innerWidth < 768 ? 0 : 88,
            right: window.innerWidth < 768 ? 0 : 24,
            left: window.innerWidth < 768 ? 0 : 'auto',
            top: window.innerWidth < 768 ? 60 : 'auto',
            width: window.innerWidth < 768 ? '100%' : 420,
            height: window.innerWidth < 768 ? 'auto' : 600,
            maxHeight: window.innerWidth < 768 ? 'calc(100vh - 60px)' : 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15,17,23,0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: window.innerWidth < 768 ? '12px 12px 0 0' : 12,
            overflow: 'hidden',
            animation: 'chatSlideUp 0.2s ease-out',
          }}>
            {/* Close bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <span style={{
                fontFamily: MONO, fontSize: 8, letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.4)',
              }}>
                ◆ AI_ASSISTANT
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', padding: 4,
                  display: 'flex', alignItems: 'center',
                }}
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <ChatWidget />
            </div>
          </div>
        </>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1001,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: open ? 'rgba(239,68,68,0.8)' : 'rgba(99,102,241,0.8)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'background 0.2s ease, transform 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Slide-up animation */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
};

export default ChatBubble;
