/**
 * dialectEngine.js — Yissian dialect text transformer
 *
 * Core rules:
 *  1. Preserve the initial consonant cluster (onset).
 *  2. Suffix selection by vowel nucleus:
 *       -iss     front/short: a, e, i, u-bare, oo, ea, ei, ie, ai, ay
 *       -riss    resonant/back: o, oa, oe, ou, ow, ee, ue, ui, ew, au, aw, oi, oy
 *                — r-glide suppressed if onset already ends in 'r'
 *       -rid     completive class (many triggers — see below)
 *       -issin'  gerundive: -ing / -in' endings
 *  3. Magic-e (VCe): keep full stem (word minus terminal 'e'), append suffix
 *       a/i/o → stem + -riss  (blade→bladriss, bite→bitriss)
 *       u     → stem + -rid   (cute→cutrid, tube→tubrid)
 *  4. -ly adverbs: transform the base word, then re-attach '-ly'
 *  5. Completive -rid triggers: -er, -le, -ness, -ment, -ful (strip suffix → stem + -rid);
 *       -ies/-ied/-ed/consonant+y; r-colored short vowel (arm, park); n't contractions
 *  6. Function words, numbers, IPs, URLs, no-vowel tokens: preserved verbatim.
 *  7. Hyphenated compounds: each segment transformed independently.
 *  8. Output case matches input: Title → Title, ALLCAPS → ALLCAPS.
 */

// ── Preserved word sets ───────────────────────────────────────────────────────

const FUNCTION_WORDS = new Set([
  'a','an','the',
  'and','but','or','nor','for','so','yet',
  'to','of','in','on','at','by','up','as','via',
  'i','we','you','he','she','it','they',
  'me','us','him','her','them',
  'my','our','your','his','its','their',
  'this','that','these','those',
  'is','be','was','were','am','are','has','have','had',
  'do','does','did',
  'not','no','yes',
  'if','then','else','when','while',
]);

// Hand-tuned overrides: lowercase source → lowercase Yissian output.
// Only needed where the algorithm gives the wrong phonological result.
const OVERRIDES = {
  // ── Founding spec examples ────────────────────────────────────────────────
  'yeah':       'yiss',
  'right':      'riss',
  'hell':       'hiss',
  'fucking':    "fissin'",
  'fuckin':     "fissin'",
  'fuck':       'friss',

  // ── ea-vowel ambiguity (ea defaults → iss; override when sound is /eɪ/) ──
  'steak':      'striss',
  'great':      'griss',
  'break':      'briss',
  'bear':       'briss',
  'wear':       'wriss',
  'swear':      'swriss',
  'pear':       'priss',

  // ── Irregular short-vowel magic-e words ───────────────────────────────────
  // VCe pattern but vowel is actually SHORT — would falsely fire magic-e rule.
  'love':       'liss',
  'give':       'giss',
  'live':       'liss',   // verb "to live"; adjective "live" (lively) → riss is fine
  'have':       'havrid',
  'done':       'diss',
  'none':       'niss',
  'gone':       'griss',
  'come':       'criss',
  'some':       'sriss',

  // ── -ight / -igh cluster ─────────────────────────────────────────────────
  'night':      'niss',
  'light':      'liss',
  'might':      'miss',
  'fight':      'fiss',
  'sight':      'siss',
  'tight':      'tiss',
  'bright':     'briss',
  'knight':     'niss',
  'flight':     'fliss',
  'blight':     'bliss',
  'slight':     'sliss',
  'plight':     'pliss',

  // ── magic-e /aɪ/ words with wh-onset collapse ────────────────────────────
  'white':      'wiss',   // wh → w, long-i → iss

  // ── Dark/driss ─────────────────────────────────────────────────────────────
  'dark':       'driss',

  // ── Pinned common words ────────────────────────────────────────────────────
  'now':        'niss',   // 'ow' would give -riss; pinned to -iss
  'coke':       'criss',
  'cool':       'criss',
  'over':       'overid',
  'water':      'wiss',
  'quick':      'quickrid',
  'moment':     'momrid',

  // ── Contractions & spoken forms ───────────────────────────────────────────
  "can't":      'criss',
  "don't":      'driss',
  "won't":      'wriss',
  "it's":       'iss',
  "that's":     'thiss',
  "what's":     'wriss',
  "i'm":        'iss',
  "you're":     'yriss',
  "they're":    'thriss',
  "we're":      'wriss',
  "i've":       'iss',
  "you've":     'yriss',

  // ── Common UI / homelab words ─────────────────────────────────────────────
  'error':      'iss',
};

// ── Vowel nucleus sets ────────────────────────────────────────────────────────

const DIGRAPHS = [
  'ea','ee','ei','ie','ai','ay',
  'oa','oe','oo','ou','ow','ue','ui','ew',
  'au','aw','oi','oy',
];

// Nuclei that trigger the r-glide (→ -riss)
// Note: 'oo' is intentionally absent — the dialect treats it as tight/front → -iss
const RISS_NUCLEI = new Set([
  'o','oa','oe','ou','ow',    // back round (o-family)
  'ee',                        // front tense (resonant quality → riss)
  'ue','ui','ew',              // back round (u-family digraphs; bare 'u' → iss)
  'au','aw','oi','oy',         // diphthongs
]);

function getNucleus(afterOnset) {
  const two = afterOnset.slice(0, 2).toLowerCase();
  if (DIGRAPHS.includes(two)) return two;
  const one = afterOnset[0]?.toLowerCase();
  if (one && 'aeiou'.includes(one)) return one;
  return null;
}

// ── Core word transform ───────────────────────────────────────────────────────

function transformCore(word) {
  const lower = word.toLowerCase();

  if (OVERRIDES[lower]) return OVERRIDES[lower];
  if (FUNCTION_WORDS.has(lower)) return lower;
  if (word.length <= 2) return lower;
  if (!/[aeiou]/i.test(word)) return lower;

  const onset = (lower.match(/^([^aeiou]*)/) || ['', ''])[1];

  // ── Gerund / progressive ──────────────────────────────────────────────────
  if (/in[g']?$/.test(lower)) return onset + "issin'";

  // ── -ly adverbs: transform base word, re-attach '-ly' ────────────────────
  if (/[a-z]ly$/.test(lower) && lower.length > 3) {
    return transformCore(lower.slice(0, -2)) + 'ly';
  }

  // ── Suffix-stripping completive endings → -rid ────────────────────────────
  if (/[a-z]ness$/.test(lower) && lower.length > 5)
    return lower.slice(0, -4) + 'rid';
  if (/[a-z]ment$/.test(lower) && lower.length > 5)
    return lower.slice(0, -4) + 'rid';
  if (/[^aeiou]ful$/.test(lower) && lower.length > 4)
    return lower.slice(0, -2) + 'rid';  // strip 'ul', keep 'f': beautiful→beautifrid
  if (/[^aeiou]er$/.test(lower) && lower.length > 3)
    return lower.slice(0, -2) + 'rid';
  if (/[^aeiou]le$/.test(lower) && lower.length > 3)
    return lower.slice(0, -2) + 'rid';

  // ── Completive / plural ───────────────────────────────────────────────────
  if (/ies$/.test(lower) || /ied$/.test(lower)) return onset + 'id';
  if (/[^aeiou]ed$/.test(lower)) return onset + 'id';
  if (lower.length > 3 && /[^aeiou]y$/.test(lower)) return onset + 'id';

  // ── n't contractions → full contraction (no apostrophe) + -rid ───────────
  if (lower.includes("n't")) return lower.replace("'", '') + 'rid';

  // ── Magic-e long vowel detection ─────────────────────────────────────────
  // Rule: keep full stem (word minus terminal 'e'), append suffix
  //   a/i/o → stem + -riss  (blade→bladriss, bite→bitriss, mode→modriss)
  //   u     → stem + -rid   (cute→cutrid, tube→tubrid)
  const magicE = lower.match(/^([^aeiou]*[aiou][^aeiou]+)e$/);
  if (magicE) {
    const stem = magicE[1];
    const v = stem.match(/[aiou]/)[0];
    if (v === 'u') return stem + 'rid';
    return stem + (onset.endsWith('r') ? 'iss' : 'riss');
  }

  // ── Standard suffix selection ─────────────────────────────────────────────
  const afterOnset = lower.slice(onset.length);
  const nucleus = getNucleus(afterOnset);
  if (!nucleus) return lower;

  // R-colored short vowel: single-letter nucleus immediately followed by 'r' → -rid
  // Captures: arm→armrid, park→parkrid, star→starrid, hard→hardrid
  const afterNucleus = afterOnset.slice(nucleus.length);
  if (nucleus.length === 1 && afterNucleus.startsWith('r')) {
    return lower + 'rid';
  }

  const needsR = RISS_NUCLEI.has(nucleus) && !onset.endsWith('r');
  return onset + (needsR ? 'riss' : 'iss');
}

// ── Case preservation ─────────────────────────────────────────────────────────

function preserveCase(transformed, original) {
  if (!original || !transformed) return transformed;
  if (original.length > 1 && original === original.toUpperCase()) {
    return transformed.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase() && /[a-z]/.test(original)) {
    return transformed[0].toUpperCase() + transformed.slice(1);
  }
  return transformed;
}

// ── Tokeniser & public API ────────────────────────────────────────────────────

const TOKEN_RE = /([A-Za-z][A-Za-z']*|[0-9][\d.,:/%-]*|\s+|[^\w\s])/g;
const PRESERVE_TOKEN = /^(https?:\/\/\S+|\d+\.\d+\.\d+\.\d+[\d.]*|[\d.,:/%-]+)$/;

function transformToken(token) {
  if (/^\s+$/.test(token)) return token;
  if (/^[^\w]+$/.test(token)) return token;
  if (PRESERVE_TOKEN.test(token)) return token;
  if (token.includes('-')) {
    return token.split('-')
      .map(part => preserveCase(transformCore(part), part))
      .join('-');
  }
  return preserveCase(transformCore(token), token);
}

/**
 * Translate a string to Yissian dialect.
 * Safe for non-string input — returned unchanged.
 */
export function translateToDialect(text) {
  if (typeof text !== 'string' || !text) return text;
  return text.replace(TOKEN_RE, transformToken);
}

/** Browser console smoke test: dialectEngine_test() */
export function dialectEngine_test() {
  const cases = [
    // Founding examples
    ["Hell yeah, Fuckin' Right!",  "Hiss Yiss, Fissin' Riss!"],
    ["Gull's Nest",                "Giss Niss"],
    // Suffix classes
    ["fries",                      "frid"],         // -ies → -rid
    ["coke",                       "criss"],        // override
    ["cute",                       "cutrid"],       // magic-e long-u: stem + -rid
    ["tube",                       "tubrid"],       // magic-e long-u
    ["blade",                      "bladriss"],     // magic-e long-a: stem + -riss
    // -oo → -iss; -ee → -riss
    ["moon",                       "miss"],
    ["beer",                       "briss"],
    // -er, -le, -ness, -ment, -ful → -rid
    ["better",                     "bettrid"],
    ["apple",                      "apprid"],
    ["darkness",                   "darkrid"],
    ["movement",                   "moverid"],
    ["beautiful",                  "beautifrid"],
    // -ly: transform base + re-attach
    ["really",                     "rissly"],
    // r-colored vowel
    ["arm",                        "armrid"],
    ["park",                       "parkrid"],
    // n't contractions
    ["isn't",                      "isntrid"],
    // UI/data preserved
    ["Downloading",                "Dissin'"],
    ["now",                        "niss"],
    ["2.0 TB free",                "2.0 TB friss"],
    ["cheese-steak",               "chiss-striss"],
  ];
  cases.forEach(([input, expected]) => {
    const result = translateToDialect(input);
    const pass = result.toLowerCase() === expected.toLowerCase();
    console.log(`${pass ? '✓' : '✗'} "${input}" → "${result}"${pass ? '' : ` (expected "${expected}")`}`);
  });
}
