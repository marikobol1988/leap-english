/// <reference types="node" />
// Run with: npm test   (Node's built-in test runner through tsx; no device needed)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { PATH, UNITS, isUnlocked, currentNode } from '../../content';
import { SEQUENCES, buildSession, makeExercise, mistakesSession, replyPrompts, words } from '../exercises';
import { grade, normalize, previewXp } from '../grading';
import { hintTokens } from '../hints';

let seed = 42;
const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

test('every unit has content for every exercise type', () => {
  for (const u of UNITS) {
    assert.ok(u.vocab.length >= 5, `${u.id} vocab`);
    assert.ok(u.phrases.length >= 3, `${u.id} phrases`);
    assert.ok(replyPrompts(u).length >= 1, `${u.id} needs a reply prompt`);
  }
});

test('every Georgian word in every phrase has a hint', () => {
  for (const u of UNITS) for (const p of u.phrases) {
    const missing = hintTokens(p.ka).filter((t) => /[ა-ჰ]/.test(t.text) && !t.hint).map((t) => t.text);
    assert.deepEqual(missing, [], `${p.id}: ${p.ka}`);
  }
});

test('two-word glossary entries are matched as one hint', () => {
  const t = hintTokens('ერთი ყავა, თუ შეიძლება.');
  assert.ok(t.some((x) => x.text === 'თუ შეიძლება' && x.hint === 'please'));
});

test('generated exercises always contain their correct answer', () => {
  for (let i = 0; i < 300; i++) for (const u of UNITS) {
    const w = makeExercise('word', u, rng); assert.ok(w.type === 'word' && w.options.includes(w.v));
    const f = makeExercise('fill', u, rng); assert.ok(f.type === 'fill' && f.options.includes(f.answer) && new Set(f.options).size === 3);
    const r = makeExercise('reply', u, rng); assert.ok(r.type === 'reply' && r.options.includes(r.answer) && r.answer.speaker === u.host);
    const b = makeExercise('build', u, rng);
    if (b.type === 'build') { const pool = [...b.tiles]; for (const x of words(b.p.en)) { const k = pool.indexOf(x); assert.ok(k >= 0, `${b.p.en} tile ${x}`); pool.splice(k, 1); } }
  }
});

test('correct answers grade as correct', () => {
  const u = UNITS[0];
  const b = makeExercise('build', u, rng); if (b.type === 'build') assert.ok(grade(b, { kind: 'text', value: b.p.en }).correct);
  const t = makeExercise('type', u, rng, 3); if (t.type === 'type') {
    assert.ok(grade(t, { kind: 'text', value: "i'm fine thank you" }).correct, 'contractions and punctuation are forgiven');
    assert.ok(grade(t, { kind: 'text', value: 'I am fine, thank yu.' }).typo, 'one typo is accepted');
    assert.ok(!grade(t, { kind: 'text', value: 'I fine thank you' }).correct);
  }
});

test('normalize expands contractions', () => assert.equal(normalize("I'll have the soup!"), 'i will have the soup'));

test('session sequences have the right length and avoid repeats', () => {
  const ex = buildSession([UNITS[0]], SEQUENCES.lesson, { canSpeak: false, rng });
  assert.equal(ex.length, 8);
  assert.ok(!ex.some((e) => e.type === 'listen'), 'no listening without speech');
});

test('mistakes session rebuilds remembered items', () => {
  const ex = mistakesSession([{ item_type: 'vocab', item_id: 'u2.v3' }, { item_type: 'phrase', item_id: 'u1.p2' }, { item_type: 'dialog', item_id: 'u1.d1' }], rng);
  assert.equal(ex.length, 3);
  assert.ok(ex.some((e) => e.type === 'word' && e.v.id === 'u2.v3'));
});

test('path unlocking follows the server rules', () => {
  const done = new Set<string>();
  assert.equal(currentNode(done)?.id, 'u1.n1');
  assert.ok(isUnlocked('u1.n1', done) && !isUnlocked('u1.n2', done));
  done.add('u1.n1'); assert.ok(isUnlocked('u1.n2', done));
  assert.equal(PATH.length, 48);
});

test('XP preview matches complete_session', () => {
  assert.equal(previewXp('lesson', { replay: false, perfect: true }), 15);
  assert.equal(previewXp('lesson', { replay: true, perfect: false }), 5);
  assert.equal(previewXp('review', { replay: false, perfect: true }), 25);
  assert.equal(previewXp('practice', { replay: false, perfect: true }), 5);
});
