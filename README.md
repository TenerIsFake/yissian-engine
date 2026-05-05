# yissian-engine

Yissian dialect text transformer. Preserves the initial consonant cluster (onset) of every word and replaces the vowel nucleus + coda with a phonological suffix.

```
"Hell yeah, Fuckin' Right!" → "Hiss Yiss, Fissin' Riss!"
"beautiful"                 → "beautifrid"
"downloading"               → "dissin'"
"blade"                     → "bladriss"
```

## Install

```bash
npm install yissian-engine
```

## Usage

```js
import { translateToDialect, mergeOverrides } from 'yissian-engine';

translateToDialect('Hell yeah!');  // → 'Hiss Yiss!'

// Merge live overrides fetched from yissian.json
const res = await fetch('https://raw.githubusercontent.com/TenerIsFake/homepage-claude/master/yissian.json');
const { overrides } = await res.json();
mergeOverrides(overrides);
```

### Bundled fallback overrides

```js
import overrides from 'yissian-engine/overrides';
// { yeah: 'yiss', hell: 'hiss', ... }
```

## Suffix rules

| Suffix | When |
|--------|------|
| `-iss` | Short/front vowels: a, e, i, u-bare, oo |
| `-riss` | Round/resonant vowels: o, ou, ow, ee, oi, oy… |
| `-rid` | Completive class: -er, -le, -ness, -ment, -ful, -ies/-ied/-ed/-y, r-coloured vowels, n't contractions, magic-e long-u |
| `-issin'` | Gerunds: -ing / -in' |
| base + `-ly` | Adverbs: transform base, re-attach -ly |

Function words, numbers, IPs, and URLs are always preserved verbatim.

## API

### `translateToDialect(text: string): string`
Translates a string to Yissian. Safe for non-string input (returned unchanged).

### `mergeOverrides(map: Record<string, string>): void`
Merges additional overrides into the running engine at runtime. Useful for applying a freshly-fetched `yissian.json` without re-importing.

### `dialectEngine_test(): void`
Runs a smoke test suite in the console. 22 cases covering all suffix classes.
