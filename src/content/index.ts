import { CHARACTERS, SECTIONS, UNITS } from './data';
import type { NodeKind, PathNode, Unit } from './types';

export * from './data';
export * from './types';

/** Every unit uses the same path shape: two lessons, a chest, two lessons, a review. */
export const NODE_PATTERN: NodeKind[] = ['lesson', 'lesson', 'chest', 'lesson', 'lesson', 'review'];

export const PATH: PathNode[] = UNITS.flatMap((u, ui) => {
  let lesson = 0;
  return NODE_PATTERN.map((kind, i) => ({
    id: `${u.id}.n${i + 1}`,
    unitId: u.id,
    position: i + 1,
    seq: ui * NODE_PATTERN.length + i + 1,
    kind,
    lessonNumber: kind === 'lesson' ? ++lesson : undefined,
  }));
});

export const unitById = (id: string): Unit => {
  const u = UNITS.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown unit ${id}`);
  return u;
};
export const nodeById = (id: string) => PATH.find((n) => n.id === id);
export const nodesOfUnit = (unitId: string) => PATH.filter((n) => n.unitId === unitId);
export const sectionOf = (unit: Unit) => SECTIONS.find((s) => s.id === unit.sectionId)!;
export const character = (id: keyof typeof CHARACTERS) => CHARACTERS[id];

/** The first node not yet completed, or undefined when the whole course is done. */
export function currentNode(done: ReadonlySet<string>) {
  return PATH.find((n) => !done.has(n.id));
}
export function isUnlocked(nodeId: string, done: ReadonlySet<string>) {
  const n = nodeById(nodeId);
  if (!n) return false;
  if (n.seq === 1) return true;
  const prev = PATH.find((p) => p.seq === n.seq - 1);
  return !!prev && done.has(prev.id);
}
/** Units the learner has reached (used by Practice). */
export function unlockedUnits(done: ReadonlySet<string>): Unit[] {
  const cur = currentNode(done);
  const upTo = cur ? UNITS.findIndex((u) => u.id === cur.unitId) : UNITS.length - 1;
  return UNITS.slice(0, upTo + 1);
}

