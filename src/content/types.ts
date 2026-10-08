export type CharacterId =
  | 'nino' | 'giorgi' | 'tamar' | 'luka' | 'mariam'
  | 'tom' | 'emma' | 'james' | 'kate' | 'david' | 'lucy' | 'anna' | 'brown';

export type HairStyle = 'long' | 'short' | 'beard' | 'bun' | 'curly';

export interface Character {
  id: CharacterId;
  name: string;
  isGeorgian: boolean;
  bio: string;
  look: { skin: string; hair: string; style: HairStyle; shirt: string; bg: string };
}

export interface VocabItem { id: string; en: string; ka: string; image: string; phonetic?: string }
export interface Phrase { id: string; en: string; ka: string }
export interface DialogLine { id: string; speaker: CharacterId; en: string; ka: string }
export interface CommonMistake { id: string; wrong: string; correct: string; note: string }
export interface Grammar { title: string; explanation: string; examples: { en: string; ka: string }[] }

export interface Unit {
  id: string;
  sectionId: string;
  position: number;
  en: string;
  ka: string;
  tip: string;
  shortTip: string;
  host: CharacterId;
  partner: CharacterId;
  scene: string;
  grammar: Grammar;
  vocab: VocabItem[];
  phrases: Phrase[];
  dialog: DialogLine[];
  mistakes: CommonMistake[];
  soundTip: string;
  note: string;
}

export interface Section {
  id: string;
  position: number;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  name: string;
  description: string;
  locked: boolean;
  /** Titles shown for locked sections that have no content yet */
  comingSoon?: { en: string; ka: string }[];
}

export type NodeKind = 'lesson' | 'chest' | 'review';
export interface PathNode { id: string; unitId: string; position: number; seq: number; kind: NodeKind; lessonNumber?: number }

export type ItemType = 'vocab' | 'phrase' | 'dialog';
