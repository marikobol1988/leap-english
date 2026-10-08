import { UNITS } from '../content';
import type { DialogLine, ItemType, Phrase, Unit, VocabItem } from '../content/types';

export type ExerciseType = 'word' | 'match' | 'choose' | 'build' | 'listen' | 'type' | 'fill' | 'reply';

interface Base { type: ExerciseType; unit: Unit; itemType?: ItemType; itemId?: string }
export interface WordEx extends Base { type: 'word'; v: VocabItem; options: VocabItem[] }
export interface MatchEx extends Base { type: 'match'; pairs: VocabItem[] }
export interface ChooseEx extends Base { type: 'choose'; p: Phrase; options: string[] }
export interface BuildEx extends Base { type: 'build' | 'listen'; p: Phrase; tiles: string[] }
export interface TypeEx extends Base { type: 'type'; p: Phrase }
export interface FillEx extends Base { type: 'fill'; p: Phrase; tokens: string[]; blank: number; tail: string; answer: string; options: string[] }
export interface ReplyEx extends Base { type: 'reply'; prompt: DialogLine; answer: DialogLine; options: DialogLine[] }
export type Exercise = WordEx | MatchEx | ChooseEx | BuildEx | TypeEx | FillEx | ReplyEx;

/** Random source, injectable so tests are deterministic. */
export type Rng = () => number;
const pick = <T>(xs: readonly T[], rng: Rng): T => xs[Math.floor(rng() * xs.length)];
export function shuffle<T>(xs: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export const words = (s: string) => s.replace(/[.,?!]/g, '').split(' ').filter(Boolean);
const clean = (w: string) => w.replace(/[.,?!]/g, '');
const KEEP_CASE = /^(I|Nino|Georgia|Batumi|Wi-Fi|Tom|London|Tamar|Beridze)$/;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Grammar words and two wrong options that cannot fit the same slot. */
const CONFUSABLE: Record<string, [string, string]> = {
  a: ['an', 'these'], an: ['a', 'these'], the: ['an', 'those'], is: ['are', 'am'], am: ['is', 'are'], are: ['is', 'am'],
  do: ['does', 'is'], does: ['do', 'is'], can: ['does', 'is'], will: ['am', 'does'], would: ['am', 'does'],
  my: ['me', 'I'], your: ['you', 'yours'], to: ['at', 'of'], for: ['of', 'from'], at: ['of', 'from'], by: ['with', 'of'],
  with: ['of', 'by'], of: ['for', 'from'], in: ['at', 'of'], on: ['of', 'at'], from: ['of', 'to'], how: ['what', 'who'], where: ['what', 'who'],
};

/** Dialogue lines spoken by the English partner that the Georgian host answers next. */
export const replyPrompts = (u: Unit) =>
  u.dialog.map((l, i) => i).filter((i) => u.dialog[i].speaker !== u.host && u.dialog[i + 1]?.speaker === u.host);

export function makeExercise(type: ExerciseType, unit: Unit, rng: Rng = Math.random, index?: number): Exercise {
  if (type === 'word') {
    const v = index !== undefined ? unit.vocab[index] : pick(unit.vocab, rng);
    const options = shuffle([v, ...shuffle(unit.vocab.filter((x) => x !== v), rng).slice(0, 2)], rng);
    return { type, unit, v, options, itemType: 'vocab', itemId: v.id };
  }
  if (type === 'match') return { type, unit, pairs: shuffle(unit.vocab, rng).slice(0, 5) };
  if (type === 'reply') {
    const idx = index !== undefined ? index : pick(replyPrompts(unit), rng);
    const prompt = unit.dialog[idx], answer = unit.dialog[idx + 1];
    const others = shuffle(UNITS.filter((u) => u !== unit).flatMap((u) => u.dialog.filter((l) => l.speaker === u.host)), rng).slice(0, 2);
    return { type, unit, prompt, answer, options: shuffle([answer, ...others], rng), itemType: 'dialog', itemId: prompt.id };
  }
  const p = index !== undefined ? unit.phrases[index] : pick(unit.phrases, rng);
  const ref = { itemType: 'phrase' as const, itemId: p.id };
  if (type === 'choose') {
    const options = shuffle([p.en, ...shuffle(unit.phrases.filter((x) => x !== p), rng).slice(0, 2).map((x) => x.en)], rng);
    return { type, unit, p, options, ...ref };
  }
  if (type === 'build' || type === 'listen') {
    const own = new Set(words(p.en).map((w) => w.toLowerCase()));
    const pool = [...new Set(unit.phrases.flatMap((q) => words(q.en))
      .filter((w) => !own.has(w.toLowerCase()))
      .map((w) => (KEEP_CASE.test(w) ? w : w.toLowerCase())))];
    return { type, unit, p, tiles: shuffle([...words(p.en), ...shuffle(pool, rng).slice(0, 3)], rng), ...ref };
  }
  if (type === 'fill') {
    const tokens = p.en.split(' ');
    const grammar = tokens.map((t, i) => [i, clean(t).toLowerCase()] as const).filter(([, w]) => w in CONFUSABLE);
    let blank: number, base: string, wrong: string[];
    if (grammar.length) {
      [blank, base] = pick(grammar, rng);
      wrong = [...CONFUSABLE[base]];
    } else {
      const content = tokens.map((t, i) => [i, clean(t)] as const).filter(([, w]) => w.length > 2 && !KEEP_CASE.test(w));
      [blank, base] = content.length ? pick(content, rng) : [0, clean(tokens[0])];
      base = base.toLowerCase();
      wrong = shuffle(UNITS.filter((u) => u !== unit).flatMap((u) => u.vocab.map((v) => v.en).filter((w) => !w.includes(' '))), rng).slice(0, 2);
    }
    const raw = clean(tokens[blank]);
    const answer = blank === 0 || KEEP_CASE.test(raw) ? raw : base;
    const show = (o: string) => (blank === 0 ? cap(o) : o);
    return { type, unit, p, tokens, blank, tail: tokens[blank].slice(raw.length), answer, options: shuffle([answer, ...wrong.map(show)], rng), ...ref };
  }
  return { type: 'type', unit, p, ...ref };
}

export type SessionKind = 'lesson' | 'review' | 'practice';
export type PracticeMode = 'quick' | 'words' | 'listen' | 'write' | 'build' | 'talk' | 'unit' | 'mistakes';

/** 'L2' = listening when the device can speak, otherwise a reading exercise. */
type Slot = ExerciseType | 'L2';
export const SEQUENCES: Record<'lesson' | 'review' | Exclude<PracticeMode, 'mistakes'>, Slot[]> = {
  lesson: ['word', 'word', 'choose', 'build', 'match', 'fill', 'L2', 'type'],
  review: ['choose', 'build', 'L2', 'reply', 'type', 'fill', 'match', 'build', 'reply', 'type'],
  unit: ['word', 'choose', 'build', 'fill', 'L2', 'reply', 'match', 'type'],
  quick: ['word', 'choose', 'build', 'fill', 'L2', 'reply', 'match', 'type'],
  words: ['word', 'word', 'match', 'word', 'word', 'match'],
  listen: ['listen', 'listen', 'listen', 'listen', 'listen', 'listen'],
  write: ['type', 'type', 'type', 'type', 'type', 'type'],
  build: ['build', 'fill', 'build', 'fill', 'build', 'fill'],
  talk: ['reply', 'reply', 'reply', 'reply', 'reply', 'reply'],
};

export function buildSession(units: Unit[], seq: Slot[], opts: { canSpeak: boolean; rng?: Rng }): Exercise[] {
  const rng = opts.rng ?? Math.random;
  const used = new Set<string>();
  return seq.map((slot) => {
    const type: ExerciseType = slot === 'L2' ? (opts.canSpeak ? 'listen' : 'choose') : slot;
    let ex: Exercise, tries = 0;
    do { ex = makeExercise(type, pick(units, rng), rng); tries++; } while (ex.itemId && used.has(ex.itemId) && tries < 8);
    if (ex.itemId) used.add(ex.itemId);
    return ex;
  });
}

/** Rebuild exercises for items the learner previously got wrong. */
export function mistakesSession(items: { item_type: ItemType; item_id: string }[], rng: Rng = Math.random): Exercise[] {
  return shuffle(items, rng).slice(0, 8).flatMap((m) => {
    const unit = UNITS.find((u) => m.item_id.startsWith(u.id + '.'));
    if (!unit) return [];
    const list = m.item_type === 'vocab' ? unit.vocab : m.item_type === 'phrase' ? unit.phrases : unit.dialog;
    const i = list.findIndex((x) => x.id === m.item_id);
    if (i < 0) return [];
    if (m.item_type === 'vocab') return [makeExercise('word', unit, rng, i)];
    if (m.item_type === 'dialog') return replyPrompts(unit).includes(i) ? [makeExercise('reply', unit, rng, i)] : [];
    return [makeExercise(pick(['build', 'type', 'choose', 'fill'] as const, rng), unit, rng, i)];
  });
}
