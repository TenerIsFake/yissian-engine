import React from 'react';

/**
 * PersonaAvatar — animated avatar for each Gemini chat persona.
 * Uses emoji glyphs with CSS animation overlays (breathing, glow).
 * No external assets needed — works offline.
 */

const PERSONA_AVATARS = {
  // Standard
  media_assistant: { glyph: '🎬', hue: 210, label: 'MA' },
  mixologist:      { glyph: '🍸', hue: 330, label: 'MX' },
  film_snob:       { glyph: '🎩', hue: 270, label: 'FS' },
  it_admin:        { glyph: '🖥️', hue: 145, label: 'IT' },
  trivia_master:   { glyph: '🎯', hue: 50,  label: 'TM' },
  kids_mode:       { glyph: '🏴‍☠️', hue: 25,  label: 'CJ' },
  binge_watcher:   { glyph: '🛋️', hue: 195, label: 'BW' },
  // Historical
  nostradamus:     { glyph: '🔮', hue: 280, label: 'ND' },
  sun_tzu:         { glyph: '⚔️',  hue: 0,   label: 'ST' },
  socrates:        { glyph: '🏛️', hue: 40,  label: 'SO' },
  plato:           { glyph: '📜', hue: 45,  label: 'PL' },
  nietzsche:       { glyph: '🦅', hue: 350, label: 'FN' },
  galileo:         { glyph: '🔭', hue: 220, label: 'GG' },
  // Literary
  mark_twain:      { glyph: '✒️',  hue: 30,  label: 'MT' },
  steinbeck:       { glyph: '🌾', hue: 55,  label: 'JS' },
  hemingway:       { glyph: '🥃', hue: 20,  label: 'EH' },
};

const DEFAULT_AVATAR = { glyph: '🤖', hue: 200, label: '??' };

export function getPersonaAvatar(personaKey) {
  return PERSONA_AVATARS[personaKey] || DEFAULT_AVATAR;
}

export default function PersonaAvatar({ persona, size = 28, speaking = false, idle = true }) {
  const { glyph, hue } = getPersonaAvatar(persona);
  const glowColor = `hsla(${hue}, 70%, 60%, ${speaking ? 0.6 : 0.25})`;
  const ringColor = `hsla(${hue}, 60%, 50%, ${speaking ? 0.8 : 0.3})`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        lineHeight: 1,
        background: `radial-gradient(circle at 40% 35%, hsla(${hue}, 40%, 25%, 0.8), hsla(${hue}, 30%, 10%, 0.9))`,
        border: `1.5px solid ${ringColor}`,
        boxShadow: speaking
          ? `0 0 ${size * 0.4}px ${glowColor}, inset 0 0 ${size * 0.2}px ${glowColor}`
          : `0 0 ${size * 0.15}px ${glowColor}`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        animation: idle && !speaking ? 'avatarBreathe 3s ease-in-out infinite' : speaking ? 'avatarPulse 0.8s ease-in-out infinite' : 'none',
        flexShrink: 0,
        userSelect: 'none',
      }}
      title={persona}
    >
      {glyph}
    </div>
  );
}

export const AVATAR_KEYFRAMES = `
  @keyframes avatarBreathe {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50% { transform: scale(1.04); opacity: 1; }
  }
  @keyframes avatarPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
`;
