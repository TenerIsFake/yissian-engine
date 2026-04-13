import React, { useState, useEffect } from 'react';
import { Shield, Key, QrCode, X, AlertCircle, Check } from 'lucide-react';

const MONO = 'monospace';
const TOKEN_KEY = 'gemini-chat-token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AuthModal({ onAuthenticated, onClose }) {
  const [step, setStep] = useState('loading'); // loading | setup | verify | done
  const [qrData, setQrData] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onAuthRef = React.useRef(onAuthenticated);
  onAuthRef.current = onAuthenticated;

  // Check auth status on mount (runs once — ref avoids dep on unstable callback)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/flask/chat/auth/status', {
          headers: authHeaders(),
        });
        const data = await r.json();
        if (data.authenticated) {
          onAuthRef.current();
          return;
        }
        setStep(data.setup ? 'verify' : 'setup');
      } catch {
        setStep('setup');
      }
    })();
  }, []);

  const handleSetup = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const r = await fetch('/api/flask/chat/auth/setup', { method: 'POST' });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Setup failed');
        if (data.error?.includes('Already set up')) setStep('verify');
        return;
      }
      setQrData(data.qr);
      setSecret(data.secret);
      setStep('scan');
    } catch {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setError('');
    setIsSubmitting(true);
    try {
      const r = await fetch('/api/flask/chat/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Verification failed');
        setCode('');
        return;
      }
      setAuthToken(data.token);
      setStep('done');
      setTimeout(() => onAuthRef.current(), 800);
    } catch {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'loading') return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 16,
    }}>
      {onClose && (
        <button onClick={onClose} style={{
          position: 'absolute', top: 8, right: 8, background: 'none',
          border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <X size={14} color="rgba(255,255,255,0.3)" />
        </button>
      )}

      {/* SETUP — first time */}
      {step === 'setup' && (
        <div style={{ textAlign: 'center', maxWidth: 240 }}>
          <Shield size={28} color="rgba(59,130,246,0.7)" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            SECURE CHAT SETUP
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
            Protect your AI chat with a one-time authenticator setup. You'll scan a QR code with Google Authenticator or similar.
          </div>
          <button
            onClick={handleSetup}
            disabled={isSubmitting}
            style={{
              background: 'rgba(59,130,246,0.6)', border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: 6, padding: '8px 20px', color: 'rgba(255,255,255,0.9)',
              fontSize: 11, fontFamily: MONO, cursor: 'pointer', letterSpacing: '0.1em',
              width: '100%',
            }}
          >
            {isSubmitting ? 'GENERATING...' : 'BEGIN SETUP'}
          </button>
        </div>
      )}

      {/* SCAN — show QR code */}
      {step === 'scan' && (
        <div style={{ textAlign: 'center', maxWidth: 260 }}>
          <QrCode size={20} color="rgba(59,130,246,0.7)" style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
            SCAN WITH AUTHENTICATOR
          </div>
          {qrData && (
            <div style={{
              background: '#fff', borderRadius: 8, padding: 8,
              display: 'inline-block', marginBottom: 10,
            }}>
              <img src={qrData} alt="TOTP QR Code" style={{ width: 160, height: 160, display: 'block' }} />
            </div>
          )}
          <div style={{
            fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
            wordBreak: 'break-all', marginBottom: 12, padding: '0 8px',
          }}>
            Manual key: {secret}
          </div>
          <button
            onClick={() => setStep('verify')}
            style={{
              background: 'rgba(59,130,246,0.6)', border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: 6, padding: '8px 20px', color: 'rgba(255,255,255,0.9)',
              fontSize: 11, fontFamily: MONO, cursor: 'pointer', letterSpacing: '0.1em',
              width: '100%',
            }}
          >
            I'VE SCANNED IT
          </button>
        </div>
      )}

      {/* VERIFY — enter 6-digit code */}
      {step === 'verify' && (
        <div style={{ textAlign: 'center', maxWidth: 240 }}>
          <Key size={24} color="rgba(59,130,246,0.7)" style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            ENTER AUTHENTICATOR CODE
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            autoFocus
            placeholder="000000"
            style={{
              width: '100%', textAlign: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '12px 10px', color: 'rgba(255,255,255,0.9)',
              fontSize: 24, fontFamily: MONO, letterSpacing: '0.5em',
              outline: 'none', marginBottom: 12,
            }}
          />
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
              <AlertCircle size={10} color="#ef4444" />
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#ef4444' }}>{error}</span>
            </div>
          )}
          <button
            onClick={handleVerify}
            disabled={code.length !== 6 || isSubmitting}
            style={{
              background: code.length === 6 ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.2)',
              border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: 6, padding: '8px 20px', color: 'rgba(255,255,255,0.9)',
              fontSize: 11, fontFamily: MONO, cursor: code.length === 6 ? 'pointer' : 'default',
              letterSpacing: '0.1em', width: '100%',
            }}
          >
            {isSubmitting ? 'VERIFYING...' : 'VERIFY'}
          </button>
        </div>
      )}

      {/* DONE — success flash */}
      {step === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <Check size={32} color="#22c55e" style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', color: '#22c55e' }}>
            AUTHENTICATED
          </div>
        </div>
      )}
    </div>
  );
}
