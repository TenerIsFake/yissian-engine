import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Trash2, ChevronDown, Loader, Mic, MicOff, Volume2, VolumeX, UserPlus, Edit3, X } from 'lucide-react';
import PersonaAvatar, { AVATAR_KEYFRAMES, getPersonaAvatar } from './PersonaAvatar.jsx';

const MONO = 'monospace';

const PERSONAS = [
  { group: 'Standard Profiles', options: [
    { value: 'media_assistant', label: 'Media Assistant' },
    { value: 'mixologist',      label: 'The Mixologist' },
    { value: 'film_snob',       label: 'The Film Snob' },
    { value: 'it_admin',        label: 'The IT Admin' },
    { value: 'trivia_master',   label: 'The Trivia Master' },
    { value: 'kids_mode',       label: 'Captain Jenkins (Kids)' },
    { value: 'binge_watcher',   label: 'The Binge Watcher' },
  ]},
  { group: 'Historical Figures', options: [
    { value: 'nostradamus', label: 'Nostradamus' },
    { value: 'sun_tzu',     label: 'Sun Tzu' },
    { value: 'socrates',    label: 'Socrates' },
    { value: 'plato',       label: 'Plato' },
    { value: 'nietzsche',   label: 'Friedrich Nietzsche' },
    { value: 'galileo',     label: 'Galileo Galilei' },
  ]},
  { group: 'Literary Legends', options: [
    { value: 'mark_twain',  label: 'Mark Twain' },
    { value: 'steinbeck',   label: 'John Steinbeck' },
    { value: 'hemingway',   label: 'Ernest Hemingway' },
  ]},
];

const GREETINGS = {
  media_assistant: "Jenkins Media Assistant online. What's in the library?",
  mixologist:      "What are we pouring for tonight's viewing?",
  film_snob:       "Ugh, fine. Let's see what passes for cinema in your library.",
  it_admin:        "Sysadmin here. Please tell me you aren't transcoding 4K right now.",
  trivia_master:   "Welcome! Let's test your knowledge on your own media collection!",
  kids_mode:       "Ahoy! Captain Jenkins here. Ready for a family-friendly adventure?",
  binge_watcher:   "I've been awake for 72 hours. What are we binging next?",
  nostradamus:     "I foresee a flickering screen in your future... What visions seek you?",
  sun_tzu:         "To know your library is to win a hundred battles. What is your target?",
  socrates:        "I know only that I know nothing of your watchlist. Why do you seek this film?",
  plato:           "Welcome to the cave. Shall we observe the shadows on the wall together?",
  nietzsche:       "God is dead, but your media server lives. What abyss shall we stare into?",
  galileo:         "Eppur si muove! The server spins. What celestial media shall we observe?",
  mark_twain:      "Truth is stranger than fiction, but fiction is what you're here for. What'll it be?",
  steinbeck:       "The server hums like a tractor in the dust. What story of men are we watchin'?",
  hemingway:       "The server is good. The movies are true. What do we watch.",
};

// ── Voice I/O helpers (Phase 8) ────────────────────────────

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

function speakText(text, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.replace(/\*+/g, '').replace(/[#_`]/g, ''));
  utt.rate = 1.05;
  utt.pitch = 1;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

// ── Persona Creator Modal (Phase 9) ───────────────────────

function PersonaCreator({ onClose, onSaved, editing }) {
  const [name, setName] = useState(editing?.name || '');
  const [instruction, setInstruction] = useState(editing?.instruction || '');
  const [greeting, setGreeting] = useState(editing?.greeting || '');
  const [glyph, setGlyph] = useState(editing?.glyph || '🤖');
  const [hue, setHue] = useState(editing?.hue ?? 200);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !instruction.trim()) { setError('Name and instruction required'); return; }
    setSaving(true);
    setError('');
    try {
      const url = editing
        ? `/api/flask/chat/personas/${editing.id}`
        : '/api/flask/chat/personas';
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), instruction: instruction.trim(), greeting: greeting.trim() || `${name.trim()} is ready.`, glyph, hue }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data.error || 'Save failed');
        setSaving(false);
        return;
      }
      const persona = await r.json();
      onSaved(persona);
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      zIndex: 20, display: 'flex', flexDirection: 'column', padding: 14, overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
          {editing ? 'EDIT PERSONA' : 'CREATE PERSONA'}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
          <X size={14} color="rgba(255,255,255,0.4)" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <PersonaAvatar persona={`_preview_${glyph}`} size={36} idle={false} />
        <input value={glyph} onChange={e => setGlyph(e.target.value.slice(-2) || '🤖')} maxLength={2} placeholder="🤖"
          style={{ width: 40, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px', color: '#fff', fontSize: 16 }} />
        <input type="range" min={0} max={360} value={hue} onChange={e => setHue(Number(e.target.value))}
          style={{ flex: 1, accentColor: `hsl(${hue}, 60%, 50%)` }} />
      </div>

      {[
        { label: 'NAME', val: name, set: setName, ph: 'e.g. The Pirate', lines: 1 },
        { label: 'SYSTEM INSTRUCTION', val: instruction, set: setInstruction, ph: 'You are a pirate who searches the Jenkins media library...', lines: 4 },
        { label: 'GREETING', val: greeting, set: setGreeting, ph: 'Ahoy! What treasure ye seek?', lines: 1 },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 2 }}>{f.label}</div>
          {f.lines > 1 ? (
            <textarea value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} rows={f.lines}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'rgba(255,255,255,0.85)', fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          ) : (
            <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'rgba(255,255,255,0.85)', fontSize: 11, outline: 'none', fontFamily: 'inherit' }} />
          )}
        </div>
      ))}

      {error && <div style={{ color: '#f87171', fontSize: 10, marginBottom: 4 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving}
        style={{ marginTop: 4, padding: '7px', background: saving ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.6)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 6, color: '#fff', fontFamily: MONO, fontSize: 10, cursor: saving ? 'default' : 'pointer', letterSpacing: '0.1em' }}>
        {saving ? 'SAVING...' : editing ? 'UPDATE' : 'CREATE'}
      </button>
    </div>
  );
}

// ── Main ChatWidget ───────────────────────────────────────

export default function ChatWidget({ headerLabel }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: GREETINGS.media_assistant }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('media_assistant');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeToolCall, setActiveToolCall] = useState(null);

  // Phase 7: Avatar speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Phase 8: Voice I/O
  const [micOn, setMicOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const recognitionRef = useRef(null);

  // Phase 9: Custom personas
  const [customPersonas, setCustomPersonas] = useState([]);
  const [showPersonaCreator, setShowPersonaCreator] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  // Phase 10: Mobile expanded
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, streamingText]);

  // Load custom personas on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/flask/chat/personas', {});
        if (r.ok) setCustomPersonas(await r.json());
      } catch { /* ignore */ }
    })();
  }, []);

  // Phase 8: Setup speech recognition
  useEffect(() => {
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recog.onend = () => setMicOn(false);
    recog.onerror = () => setMicOn(false);
    recognitionRef.current = recog;
    return () => { try { recog.abort(); } catch {} };
  }, []);

  const toggleMic = useCallback(() => {
    if (!recognitionRef.current) return;
    if (micOn) {
      recognitionRef.current.stop();
      setMicOn(false);
    } else {
      recognitionRef.current.start();
      setMicOn(true);
    }
  }, [micOn]);

  // Load session list
  const loadSessions = useCallback(async () => {
    try {
      const r = await fetch('/api/flask/chat/sessions');
      if (r.ok) setSessions(await r.json());
    } catch { /* ignore */ }
  }, []);

  // Load a specific session
  const loadSession = useCallback(async (id) => {
    try {
      const r = await fetch(`/api/flask/chat/sessions/${id}`);
      if (!r.ok) return;
      const data = await r.json();
      setSessionId(data.id);
      setActivePersona(data.persona);
      setMessages(data.messages.map(m => ({ role: m.role, text: m.text })));
      setShowSessions(false);
    } catch { /* ignore */ }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/flask/chat/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessionId === id) {
        setSessionId(null);
        setMessages([{ role: 'bot', text: getGreeting(activePersona) }]);
      }
    } catch { /* ignore */ }
  }, [sessionId, activePersona]);

  // Resolve greeting for any persona (built-in or custom)
  const getGreeting = useCallback((key) => {
    if (GREETINGS[key]) return GREETINGS[key];
    const cp = customPersonas.find(p => p.key === key);
    return cp?.greeting || 'Ready.';
  }, [customPersonas]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);
    setStreamingText('');
    setActiveToolCall(null);

    const controller = new AbortController();
    abortRef.current = controller;
    try {

      const response = await fetch('/api/flask/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          persona: activePersona,
          session_id: sessionId,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = status === 429 ? 'Rate limited — please wait a moment.'
          : status === 502 ? 'Gemini backend unreachable.'
          : status === 504 ? 'Request timed out.'
          : err.error || 'Server error.';
        setMessages(prev => [...prev, { role: 'bot', text: msg }]);
        setIsLoading(false);
        return;
      }

      // Guard: response.body may be null on some edge cases
      if (!response.body) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Empty response from server.' }]);
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'chunk') {
              accumulated += event.text;
              setStreamingText(accumulated);
              setIsSpeaking(true);
            } else if (event.type === 'tool') {
              setActiveToolCall(event.name);
            } else if (event.type === 'done') {
              if (!sessionId && event.session_id) {
                setSessionId(event.session_id);
              }
            } else if (event.type === 'error') {
              accumulated += `\n[Error: ${event.message}]`;
              setStreamingText(accumulated);
            }
          } catch { /* skip malformed */ }
        }
      }

      // Finalize — save partial message even on incomplete stream
      if (accumulated) {
        setMessages(prev => [...prev, { role: 'bot', text: accumulated }]);
        if (speakerOn) {
          speakText(accumulated, () => setIsSpeaking(false));
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'bot', text: 'Network error. Is the Flask server running?' }]);
      }
    } finally {
      setStreamingText('');
      setActiveToolCall(null);
      setIsLoading(false);
      // Only clear if this is still the active controller (prevents race on rapid unmount/remount)
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [inputText, isLoading, activePersona, sessionId, speakerOn]);

  const handlePersonaSwitch = (newPersona) => {
    setActivePersona(newPersona);
    setSessionId(null);
    setMessages([{ role: 'bot', text: getGreeting(newPersona) }]);
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([{ role: 'bot', text: getGreeting(activePersona) }]);
    setShowSessions(false);
  };

  // Phase 9: After persona saved
  const handlePersonaSaved = (persona) => {
    setCustomPersonas(prev => {
      const existing = prev.findIndex(p => p.id === persona.id);
      if (existing >= 0) { const u = [...prev]; u[existing] = persona; return u; }
      return [...prev, persona];
    });
    setShowPersonaCreator(false);
    setEditingPersona(null);
    // Switch to the new persona
    handlePersonaSwitch(persona.key);
  };

  const handleDeletePersona = async (cp, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/flask/chat/personas/${cp.id}`, { method: 'DELETE' });
      setCustomPersonas(prev => prev.filter(p => p.id !== cp.id));
      if (activePersona === cp.key) handlePersonaSwitch('media_assistant');
    } catch { /* ignore */ }
  };

  // Build full persona list for dropdown
  const allPersonaGroups = [
    ...PERSONAS,
    ...(customPersonas.length > 0 ? [{
      group: 'Custom Personas',
      options: customPersonas.map(cp => ({ value: cp.key, label: cp.name })),
    }] : []),
  ];

  // Phase 10: Detect narrow viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const containerStyle = mobileExpanded ? {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)',
    display: 'flex', flexDirection: 'column', borderRadius: 0,
    border: 'none',
  } : {
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    display: 'flex', flexDirection: 'column', height: 380, overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      {/* CSS keyframes */}
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ${AVATAR_KEYFRAMES}
        @media (max-width: 639px) {
          .chat-input-area { padding: 12px !important; }
          .chat-input-area input { font-size: 16px !important; padding: 10px 12px !important; }
          .chat-input-area button { padding: 10px 18px !important; min-height: 44px; }
          .chat-header-btn { min-width: 32px; min-height: 32px; }
        }
      `}</style>

      {/* Persona creator overlay */}
      {showPersonaCreator && (
        <PersonaCreator
          editing={editingPersona}
          onClose={() => { setShowPersonaCreator(false); setEditingPersona(null); }}
          onSaved={handlePersonaSaved}
        />
      )}

      {/* Header */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.03)', gap: 4, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PersonaAvatar persona={activePersona} size={22} speaking={isSpeaking} />
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
            {headerLabel || '◆ AI_ASSISTANT ◆'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Voice toggles (Phase 8) */}
          {SpeechRecognition && (
            <button onClick={toggleMic} className="chat-header-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
              title={micOn ? 'Stop listening' : 'Voice input'}>
              {micOn
                ? <Mic size={12} color="rgba(239,68,68,0.8)" />
                : <MicOff size={12} color="rgba(255,255,255,0.25)" />}
            </button>
          )}
          <button onClick={() => { setSpeakerOn(p => !p); if (speakerOn) window.speechSynthesis?.cancel(); }} className="chat-header-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
            title={speakerOn ? 'Mute responses' : 'Read responses aloud'}>
            {speakerOn
              ? <Volume2 size={12} color="rgba(34,197,94,0.6)" />
              : <VolumeX size={12} color="rgba(255,255,255,0.25)" />}
          </button>

          <button onClick={() => { setShowSessions(p => !p); if (!showSessions) loadSessions(); }} className="chat-header-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
            title="Chat history">
            <MessageSquare size={12} color="rgba(255,255,255,0.4)" />
          </button>
          <button onClick={handleNewChat} className="chat-header-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
            title="New chat">
            <Plus size={12} color="rgba(255,255,255,0.4)" />
          </button>
          {/* Create persona */}
          <button onClick={() => { setEditingPersona(null); setShowPersonaCreator(true); }} className="chat-header-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
            title="Create custom persona">
            <UserPlus size={12} color="rgba(255,255,255,0.3)" />
          </button>
          {/* Phase 10: Mobile expand */}
          {isMobile && (
            <button onClick={() => setMobileExpanded(p => !p)} className="chat-header-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
              title={mobileExpanded ? 'Minimize' : 'Expand'}>
              <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ transform: mobileExpanded ? 'rotate(180deg)' : 'none' }} />
            </button>
          )}
          <select
            value={activePersona}
            onChange={(e) => handlePersonaSwitch(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4, padding: '3px 6px', color: 'rgba(255,255,255,0.75)',
              fontFamily: MONO, fontSize: 10, cursor: 'pointer', maxWidth: 120, outline: 'none',
            }}
          >
            {allPersonaGroups.map(({ group, options }) => (
              <optgroup key={group} label={group} style={{ color: '#000' }}>
                {options.map(({ value, label }) => (
                  <option key={value} value={value} style={{ color: '#000', background: '#fff' }}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Session list overlay */}
      {showSessions && (
        <div style={{
          position: 'absolute', top: 44, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 10, overflowY: 'auto', padding: '8px 10px',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
            CHAT HISTORY
          </div>
          {sessions.length === 0 && (
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: 20 }}>
              No saved sessions
            </div>
          )}
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                background: s.id === sessionId ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.id === sessionId ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  {s.persona} · {s.message_count} msgs
                </div>
              </div>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <Trash2 size={10} color="rgba(255,255,255,0.25)" />
              </button>
            </div>
          ))}

          {/* Custom persona management section */}
          {customPersonas.length > 0 && (
            <>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginTop: 12, marginBottom: 6 }}>
                CUSTOM PERSONAS
              </div>
              {customPersonas.map(cp => (
                <div key={cp.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 8px', borderRadius: 6, marginBottom: 2,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14 }}>{cp.glyph}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => { setEditingPersona(cp); setShowPersonaCreator(true); setShowSessions(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Edit3 size={10} color="rgba(255,255,255,0.25)" />
                    </button>
                    <button onClick={(e) => handleDeletePersona(cp, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Trash2 size={10} color="rgba(255,255,255,0.25)" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          <button
            onClick={() => setShowSessions(false)}
            style={{
              width: '100%', marginTop: 8, padding: '6px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.5)',
              fontFamily: MONO, fontSize: 9, cursor: 'pointer', letterSpacing: '0.1em',
            }}
          >
            CLOSE
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
            {msg.role === 'bot' && <PersonaAvatar persona={activePersona} size={20} idle={false} />}
            <span style={{
              background: msg.role === 'user' ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: 'rgba(255,255,255,0.88)', borderRadius: 8, padding: '6px 10px',
              fontSize: 12, lineHeight: 1.5, maxWidth: '80%', wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>{msg.text}</span>
          </div>
        ))}

        {/* Streaming text */}
        {streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6 }}>
            <PersonaAvatar persona={activePersona} size={20} speaking={true} />
            <span style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.88)', borderRadius: 8, padding: '6px 10px',
              fontSize: 12, lineHeight: 1.5, maxWidth: '80%', wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {streamingText}
              <span style={{ opacity: 0.4, animation: 'blink 1s steps(1) infinite' }}>▌</span>
            </span>
          </div>
        )}

        {/* Tool call indicator */}
        {activeToolCall && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
            <Loader size={10} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              CALLING {activeToolCall.replace(/_/g, ' ').toUpperCase()}...
            </span>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingText && !activeToolCall && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
              THINKING...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area" style={{
        display: 'flex', gap: 8, padding: '10px 14px',
        borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
        alignItems: 'center',
      }}>
        {/* Mic button inline (Phase 8) */}
        {SpeechRecognition && (
          <button onClick={toggleMic}
            style={{
              background: micOn ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${micOn ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6, padding: '6px', cursor: 'pointer', display: 'flex',
              minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center',
            }}
            title={micOn ? 'Stop' : 'Speak'}>
            {micOn ? <Mic size={14} color="#ef4444" /> : <Mic size={14} color="rgba(255,255,255,0.4)" />}
          </button>
        )}
        <input
          type="text" value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={micOn ? 'Listening...' : 'Ask me anything...'}
          disabled={isLoading}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '6px 10px', color: 'rgba(255,255,255,0.85)',
            fontSize: 12, outline: 'none', fontFamily: 'inherit',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          style={{
            background: isLoading ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.6)',
            border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.9)',
            fontSize: 12, fontFamily: MONO, cursor: isLoading ? 'default' : 'pointer',
            letterSpacing: '0.05em', minHeight: 32,
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
