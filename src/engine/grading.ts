import type { Exercise } from './exercises';

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am', "it's": 'it is', "i'll": 'i will', "i'd": 'i would', "what's": 'what is', "where's": 'where is',
  "can't": 'cannot', "don't": 'do not', "you're": 'you are', "that's": 'that is', "how's": 'how is', "we'd": 'we would',
};

/** Lower-case, expand contractions, drop punctuation and extra spaces. */
export function normalize(s: string) {
  let t = s.toLowerCase().replace(/[’`]/g, "'");
  t = t.replace(/\b[a-z]+'[a-z]+\b/g, (w) => CONTRACTIONS[w] ?? w);
  return t.replace(/can not/g, 'cannot').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function levenshtein(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export type Answer =
  | { kind: 'option'; value: string }      // word, choose, fill, reply: the chosen option's key
  | { kind: 'text'; value: string }        // build, listen (joined tiles), type
  | { kind: 'match' };                      // match exercise completed

export interface Grade { correct: boolean; typo?: boolean; message: string }

export function grade(ex: Exercise, a: Answer): Grade {
  switch (ex.type) {
    case 'word': {
      const ok = a.kind === 'option' && a.value === ex.v.id;
      return { correct: ok, message: ok ? `„${ex.v.en}“ ნიშნავს: ${ex.v.ka}.` : `სწორი პასუხი: ${ex.v.ka}` };
    }
    case 'choose': {
      const ok = a.kind === 'option' && a.value === ex.p.en;
      return { correct: ok, message: ok ? ex.unit.shortTip : `სწორი პასუხი: ${ex.p.en}` };
    }
    case 'build':
    case 'listen': {
      const ok = a.kind === 'text' && normalize(a.value) === normalize(ex.p.en);
      return { correct: ok, message: ok ? (ex.type === 'listen' ? `მნიშვნელობა: ${ex.p.ka}` : ex.unit.shortTip) : `სწორი პასუხი: ${ex.p.en}` };
    }
    case 'type': {
      if (a.kind !== 'text') return { correct: false, message: `სწორი პასუხი: ${ex.p.en}` };
      const got = normalize(a.value), want = normalize(ex.p.en);
      if (got === want) return { correct: true, message: ex.unit.shortTip };
      if (want.length > 6 && levenshtein(got, want) <= 1) return { correct: true, typo: true, message: `მცირე ბეჭდვითი შეცდომა. სწორად: ${ex.p.en}` };
      return { correct: false, message: `სწორი პასუხი: ${ex.p.en}` };
    }
    case 'fill': {
      const ok = a.kind === 'option' && a.value === ex.answer;
      return { correct: ok, message: ok ? `${ex.p.en} · ${ex.p.ka}` : `სწორი პასუხი: ${ex.answer}. ${ex.p.en}` };
    }
    case 'reply': {
      const ok = a.kind === 'option' && a.value === ex.answer.id;
      return { correct: ok, message: ok ? `„${ex.answer.en}“ ნიშნავს: ${ex.answer.ka}` : `სწორი პასუხი: ${ex.answer.en}` };
    }
    case 'match':
      return { correct: a.kind === 'match', message: 'ყველა წყვილი სწორად შეაერთე.' };
  }
}

/** Mirrors public.complete_session so the result screen can show XP before the server answers. */
export function previewXp(kind: 'lesson' | 'review' | 'practice', opts: { replay: boolean; perfect: boolean }) {
  const base = kind === 'practice' ? 5 : kind === 'review' ? 20 : opts.replay ? 5 : 10;
  return base + (opts.perfect && kind !== 'practice' ? 5 : 0);
}
