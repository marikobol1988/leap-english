import { GLOSSARY } from '../content';

export type HintToken = { text: string; hint?: string };

/** Split a Georgian sentence into tokens, attaching English hints (two-word entries win). */
export function hintTokens(sentence: string, glossary: Record<string, string> = GLOSSARY): HintToken[] {
  const parts = sentence.split(/(\s+|[,.?!:;„“…]+)/).filter((x) => x !== '');
  const out: HintToken[] = [];
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (/^[\s,.?!:;„“…]+$/.test(w)) { out.push({ text: w }); continue; }
    if (i + 2 < parts.length && /^\s+$/.test(parts[i + 1])) {
      const two = `${w} ${parts[i + 2]}`;
      if (glossary[two]) { out.push({ text: two, hint: glossary[two] }); i += 2; continue; }
    }
    out.push({ text: w, hint: glossary[w] });
  }
  return out;
}
