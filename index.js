/**
 * yissian-engine — Yissian dialect text transformer
 *
 * Core rules:
 *  1. Preserve the initial consonant cluster (onset).
 *  2. Suffix selection by vowel nucleus:
 *       -iss     front/short: a, e, i, u-bare, oo, ea, ei, ie, ai, ay
 *       -riss    resonant/back: o, oa, oe, ou, ow, ee, ue, ui, ew, au, aw, oi, oy
 *                — r-glide suppressed if onset already ends in 'r'
 *       -rid     completive class (see below)
 *       -issin'  gerundive: -ing / -in' endings
 *  3. Magic-e (VCe): keep full stem (word minus terminal 'e'), append suffix
 *       a/i/o → stem + -riss  |  u → stem + -rid
 *  4. -ly adverbs: transform base word, re-attach '-ly'
 *  5. Completive -rid triggers: -er, -le, -ness, -ment, -ful (strip suffix → stem + rid);
 *       -ies/-ied/-ed/consonant+y; r-colored short vowel (arm, park); n't contractions
 *  6. Function words, numbers, IPs, URLs, no-vowel tokens: preserved verbatim.
 *  7. Hyphenated compounds: each segment transformed independently.
 *
 * Usage:
 *   import { translateToDialect, mergeOverrides } from 'yissian-engine';
 *   import overrides from 'yissian-engine/overrides'; // bundled fallback
 *
 *   // Optionally merge fetched/updated overrides at runtime:
 *   mergeOverrides(fetchedJson.overrides);
 *
 *   translateToDialect('Hell yeah!'); // → 'Hiss Yiss!'
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

// Mutable — mergeOverrides() patches this at runtime
const OVERRIDES = {
  'yeah':     'yiss',
  'right':    'riss',
  'hell':     'hiss',
  'fucking':  "fissin'",
  'fuckin':   "fissin'",
  'fuck':     'friss',
  'steak':    'striss',
  'great':    'griss',
  'break':    'briss',
  'bear':     'briss',
  'wear':     'wriss',
  'swear':    'swriss',
  'pear':     'priss',
  'love':     'liss',
  'give':     'giss',
  'live':     'liss',
  'have':     'havrid',
  'done':     'diss',
  'none':     'niss',
  'gone':     'griss',
  'come':     'criss',
  'some':     'sriss',
  'night':    'niss',
  'light':    'liss',
  'might':    'miss',
  'fight':    'fiss',
  'sight':    'siss',
  'tight':    'tiss',
  'bright':   'briss',
  'knight':   'niss',
  'flight':   'fliss',
  'blight':   'bliss',
  'slight':   'sliss',
  'plight':   'pliss',
  'white':    'wiss',
  'dark':     'driss',
  'now':      'niss',
  'coke':     'criss',
  'cool':     'criss',
  'over':     'overid',
  'water':    'wiss',
  'quick':    'quickrid',
  'moment':   'momrid',
  "can't":    'criss',
  "don't":    'driss',
  "won't":    'wriss',
  "it's":     'iss',
  "that's":   'thiss',
  "what's":   'wriss',
  "i'm":      'iss',
  "you're":   'yriss',
  "they're":  'thriss',
  "we're":    'wriss',
  "i've":     'iss',
  "you've":   'yriss',
  'error':    'iss',
  "y'all":    'yinz',
};

/**
 * Merge additional overrides into the running engine.
 * Call this after fetching yissian.json to apply live updates.
 * @param {Record<string, string>} map — lowercase source → lowercase Yissian
 */
export function mergeOverrides(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return;
  const VALID_KEY = /^[a-z][a-z'\-]{0,49}$/;
  const VALID_VAL = /^[a-z'\-]{1,60}$/;
  for (const [k, v] of Object.entries(map)) {
    if (VALID_KEY.test(k) && typeof v === 'string' && VALID_VAL.test(v)) {
      OVERRIDES[k] = v;
    }
  }
}

// ── Vowel nucleus sets ────────────────────────────────────────────────────────

const DIGRAPHS = [
  'ea','ee','ei','ie','ai','ay',
  'oa','oe','oo','ou','ow','ue','ui','ew',
  'au','aw','oi','oy',
];

const RISS_NUCLEI = new Set([
  'o','oa','oe','ou','ow',
  'ue','ui','ew',
  'au','aw','oi','oy',
  // 'ee' is front/tense → -iss by default; ee+r centering diphthong → -riss via r-colored rule
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

  if (/in[g']?$/.test(lower)) return onset + "issin'";

  if (/[a-z]ly$/.test(lower) && lower.length > 3)
    return transformCore(lower.slice(0, -2)) + 'ly';

  if (/[a-z]ness$/.test(lower) && lower.length > 5)
    return lower.slice(0, -4) + 'rid';
  if (/[a-z]ment$/.test(lower) && lower.length > 5)
    return lower.slice(0, -4) + 'rid';
  if (/ful$/.test(lower) && lower.length > 4)
    return lower.slice(0, -2) + 'rid';
  if (/[^aeiou]er$/.test(lower) && lower.length > 3)
    return lower.slice(0, -2) + 'rid';
  if (/[^aeiou]le$/.test(lower) && lower.length > 3)
    return lower.slice(0, -2) + 'rid';

  if (/ies$/.test(lower) || /ied$/.test(lower)) return onset + 'id';
  if (/[^aeiou]ed$/.test(lower)) return onset + 'id';
  if (lower.length > 3 && /[^aeiou]y$/.test(lower)) return onset + 'id';

  if (lower.includes("n't")) return lower.replace("'", '') + 'rid';

  const magicE = lower.match(/^([^aeiou]*[aiou][^aeiou]+)e$/);
  if (magicE) {
    const stem = magicE[1];
    const v = stem.match(/[aiou]/)[0];
    if (v === 'u') return stem + 'rid';
    return stem + (onset.endsWith('r') ? 'iss' : 'riss');
  }

  const afterOnset = lower.slice(onset.length);
  const nucleus = getNucleus(afterOnset);
  if (!nucleus) return lower;

  const afterNucleus = afterOnset.slice(nucleus.length);
  if (afterNucleus.startsWith('r')) {
    // Short vowel (single letter) + r coda → completive -rid (arm, park, star)
    if (nucleus.length === 1) return lower + 'rid';
    // Digraph + r coda → centering diphthong → -riss (beer→briss, fear→friss)
    return onset + (onset.endsWith('r') ? 'iss' : 'riss');
  }

  const needsR = RISS_NUCLEI.has(nucleus) && !onset.endsWith('r');
  return onset + (needsR ? 'riss' : 'iss');
}

// ── Case preservation ─────────────────────────────────────────────────────────

function preserveCase(transformed, original) {
  if (!original || !transformed) return transformed;
  if (original.length > 1 && original === original.toUpperCase())
    return transformed.toUpperCase();
  if (original[0] === original[0].toUpperCase() && /[a-z]/.test(original))
    return transformed[0].toUpperCase() + transformed.slice(1);
  return transformed;
}

// ── Tokeniser & public API ────────────────────────────────────────────────────

const TOKEN_RE = /([A-Za-z][A-Za-z']*|[0-9][\d.,:/%-]*|\s+|[^\w\s])/g;
const PRESERVE_TOKEN = /^(https?:\/\/\S+|\d+\.\d+\.\d+\.\d+[\d.]*|[\d.,:/%-]+)$/;

function transformToken(token) {
  if (/^\s+$/.test(token)) return token;
  if (/^[^\w]+$/.test(token)) return token;
  if (PRESERVE_TOKEN.test(token)) return token;
  if (token.includes('-'))
    return token.split('-').map(p => preserveCase(transformCore(p), p)).join('-');
  return preserveCase(transformCore(token), token);
}

/**
 * Translate a string to Yissian dialect.
 * Safe for non-string input — returned unchanged.
 * @param {string} text
 * @returns {string}
 */
export function translateToDialect(text) {
  if (typeof text !== 'string' || !text) return text;
  return text.replace(TOKEN_RE, transformToken);
}

/**
 * Run a smoke test in the console.
 * Call dialectEngine_test() in a Node REPL or browser console.
 */
export function dialectEngine_test() {
  const cases = [
    ["Hell yeah, Fuckin' Right!", "Hiss Yiss, Fissin' Riss!"],
    ["Gull's Nest",               "Giss Niss"],
    ["fries",                     "frid"],
    ["coke",                      "criss"],
    ["cute",                      "cutrid"],
    ["tube",                      "tubrid"],
    ["blade",                     "bladriss"],
    ["moon",                      "miss"],
    ["beer",                      "briss"],
    ["better",                    "bettrid"],
    ["apple",                     "apprid"],
    ["darkness",                  "darkrid"],
    ["movement",                  "moverid"],
    ["beautiful",                 "beautifrid"],
    ["really",                    "rissly"],
    ["arm",                       "armrid"],
    ["park",                      "parkrid"],
    ["isn't",                     "isntrid"],
    ["now",                       "niss"],
    ["Downloading",               "Dissin'"],
    ["2.0 TB free",               "2.0 TB friss"],
    ["cheese-steak",              "chiss-striss"],
  ];
  let passed = 0;
  cases.forEach(([input, expected]) => {
    const result = translateToDialect(input);
    const ok = result.toLowerCase() === expected.toLowerCase();
    if (ok) passed++;
    console.log(`${ok ? '✓' : '✗'} "${input}" → "${result}"${ok ? '' : ` (expected "${expected}")`}`);
  });
  console.log(`\n${passed}/${cases.length} passed`);
}
