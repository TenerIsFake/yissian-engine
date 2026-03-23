import React, { useState, useRef, useEffect } from 'react';

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

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi there! How can I help you navigate the Jenkins Media server today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('media_assistant');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const newMessages = [...messages, { role: 'user', text: inputText }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/flask/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, history: messages, persona: activePersona }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'bot', text: response.ok ? data.response : 'Server issue.' }]);
    } catch {
      setMessages([...newMessages, { role: 'bot', text: 'Network error. Is the Flask server running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaSwitch = (newPersona) => {
    setActivePersona(newPersona);
    setMessages([{ role: 'bot', text: GREETINGS[newPersona] ?? 'Ready.' }]);
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      display: 'flex', flexDirection: 'column', height: 380, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)' }}>
          ◆ AI_ASSISTANT ◆ Gemini_Chat
        </span>
        <select
          value={activePersona}
          onChange={(e) => handlePersonaSwitch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4, padding: '3px 6px', color: 'rgba(255,255,255,0.75)',
            fontFamily: MONO, fontSize: 10, cursor: 'pointer', maxWidth: 180, outline: 'none',
          }}
        >
          {PERSONAS.map(({ group, options }) => (
            <optgroup key={group} label={group}>
              {options.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{
              background: msg.role === 'user' ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: 'rgba(255,255,255,0.88)', borderRadius: 8, padding: '6px 10px',
              fontSize: 12, lineHeight: 1.5, maxWidth: '85%', wordBreak: 'break-word',
            }}>{msg.text}</span>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
              THINKING...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px',
        borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
      }}>
        <input
          type="text" value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '6px 10px', color: 'rgba(255,255,255,0.85)',
            fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            background: 'rgba(59,130,246,0.6)', border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.9)',
            fontSize: 12, fontFamily: MONO, cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
