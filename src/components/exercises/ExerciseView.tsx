import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { CHARACTERS } from '../../content';
import { IMAGES } from '../../content/images';
import { shuffle, type Exercise } from '../../engine/exercises';
import type { Answer } from '../../engine/grading';
import { useAccent } from '../../lib/progress';
import { hasGeorgianVoice, speak } from '../../lib/speech';
import { colors, fonts, radius } from '../../theme';
import { HintSentence } from '../HintSentence';
import { Icon } from '../Icon';
import { Speaker } from '../Speaker';
import { T } from '../Text';

interface Props {
  ex: Exercise;
  /** true once the answer has been checked: inputs freeze */
  locked: boolean;
  /** current answer, or null when nothing is selected yet */
  onChange: (a: Answer | null) => void;
  /** match exercises grade themselves; a wrong pair is reported here */
  onMatchMiss?: () => void;
  showHintNote?: boolean;
}

export function ExerciseView(props: Props) {
  const { ex } = props;
  switch (ex.type) {
    case 'word': return <WordView {...props} ex={ex} />;
    case 'choose': return <ChooseView {...props} ex={ex} />;
    case 'build': case 'listen': return <BuildView {...props} ex={ex} />;
    case 'type': return <TypeView {...props} ex={ex} />;
    case 'fill': return <FillView {...props} ex={ex} />;
    case 'reply': return <ReplyView {...props} ex={ex} />;
    case 'match': return <MatchView {...props} ex={ex} />;
  }
}

function Head({ cat, title, sub }: { cat: string; title: string; sub: string }) {
  const a = useAccent();
  return (
    <View style={{ gap: 4 }}>
      <T style={{ fontFamily: fonts.kaBold, fontSize: 11, color: a.acc }}>{cat}</T>
      <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 24, lineHeight: 34 }}>{title}</T>
      <T v="small">{sub}</T>
    </View>
  );
}

function Choices({ options, latin, locked, onPick }: { options: { key: string; label: string }[]; latin?: boolean; locked: boolean; onPick: (key: string) => void }) {
  const a = useAccent();
  const [sel, setSel] = useState<string | null>(null);
  return (
    <View style={{ gap: 12 }}>
      {options.map((o, i) => {
        const on = sel === o.key;
        return (
          <Pressable key={o.key} disabled={locked} onPress={() => { setSel(o.key); onPick(o.key); }} accessibilityRole="radio" accessibilityState={{ selected: on }}
            style={[s.choice, on && { backgroundColor: a.acc, borderColor: a.acc }]}>
            <View style={[s.key, on && { backgroundColor: a.on }]}><T style={{ fontFamily: fonts.enBold, fontSize: 13, color: on ? a.acc : colors.muted }}>{'ABC'[i]}</T></View>
            <T style={{ flex: 1, fontSize: 17, fontFamily: latin ? (on ? fonts.enBold : fonts.en) : (on ? fonts.kaBold : fonts.ka), color: on ? a.on : colors.ink }}>{o.label}</T>
            {on && <Icon name="check-circle" size={22} color={a.on} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function GeorgianPrompt({ ex, showHintNote }: { ex: Extract<Exercise, { p: unknown }>; showHintNote?: boolean }) {
  const [ka, setKa] = useState(false);
  useEffect(() => { hasGeorgianVoice().then(setKa); }, []);
  return (
    <View style={{ gap: 6 }}>
      <Speaker who={ex.unit.host} onListen={ka ? () => speak(ex.p.ka, { lang: 'ka' }) : undefined}><HintSentence text={ex.p.ka} /></Speaker>
      {showHintNote && <T v="caption">შეეხე ხაზგასმულ სიტყვას და ნახავ თარგმანს</T>}
    </View>
  );
}

function WordView({ ex, locked, onChange }: Props & { ex: Extract<Exercise, { type: 'word' }> }) {
  useEffect(() => { const t = setTimeout(() => speak(ex.v.en), 300); return () => clearTimeout(t); }, [ex]);
  return (
    <View style={{ gap: 22 }}>
      <Head cat="ახალი სიტყვა" title={`რას ნიშნავს „${ex.v.en}“?`} sub="აირჩიე სწორი თარგმანი." />
      <View style={[s.card, { alignItems: 'center', padding: 18, gap: 10 }]}>
        <Image source={IMAGES[ex.v.image]} style={{ width: 112, height: 112 }} contentFit="contain" accessibilityIgnoresInvertColors />
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'space-between' }}>
          <View><T v="enLarge">{ex.v.en}</T>{ex.v.phonetic && <T v="small" style={{ fontFamily: fonts.en }}>{ex.v.phonetic}</T>}</View>
          <ListenButton onPress={() => speak(ex.v.en)} />
        </View>
      </View>
      <Choices locked={locked} options={ex.options.map((o) => ({ key: o.id, label: o.ka }))} onPick={(k) => onChange({ kind: 'option', value: k })} />
    </View>
  );
}

function ChooseView({ ex, locked, onChange, showHintNote }: Props & { ex: Extract<Exercise, { type: 'choose' }> }) {
  return (
    <View style={{ gap: 22 }}>
      <Head cat="თარგმანი" title="აირჩიე სწორი თარგმანი" sub={`რას ამბობს ${CHARACTERS[ex.unit.host].name} ინგლისურად?`} />
      <GeorgianPrompt ex={ex} showHintNote={showHintNote} />
      <Choices latin locked={locked} options={ex.options.map((o) => ({ key: o, label: o }))} onPick={(k) => onChange({ kind: 'option', value: k })} />
    </View>
  );
}

function BuildView({ ex, locked, onChange, showHintNote }: Props & { ex: Extract<Exercise, { type: 'build' | 'listen' }> }) {
  const a = useAccent();
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => { onChange(picked.length ? { kind: 'text', value: picked.map((i) => ex.tiles[i]).join(' ') } : null); }, [picked]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ex.type === 'listen') { const t = setTimeout(() => speak(ex.p.en), 350); return () => clearTimeout(t); } }, [ex]);
  return (
    <View style={{ gap: 22 }}>
      {ex.type === 'build'
        ? <><Head cat="წინადადება" title="ააწყვე წინადადება" sub="თარგმნე ინგლისურად." /><GeorgianPrompt ex={ex} showHintNote={showHintNote} /></>
        : <>
            <Head cat="მოსმენა" title={`რა თქვა ${CHARACTERS[ex.unit.partner].name}-მ?`} sub="ააწყვე მოსმენილი წინადადება." />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
              <ListenButton big onPress={() => speak(ex.p.en)} />
              <ListenButton label="ნელა" onPress={() => speak(ex.p.en, { slow: true })} />
            </View>
          </>}
      <T v="caption">შენი პასუხი</T>
      <View style={{ minHeight: 60, flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12, borderBottomWidth: 2, borderColor: colors.line }}>
        {picked.map((i, pos) => (
          <Pressable key={`${i}-${pos}`} disabled={locked} onPress={() => setPicked(picked.filter((_, k) => k !== pos))} style={[s.tile, { borderColor: a.acc }]}>
            <T style={s.tileText}>{ex.tiles[i]}</T>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {ex.tiles.map((w, i) => {
          const used = picked.includes(i);
          return (
            <Pressable key={i} disabled={locked || used} onPress={() => { setPicked([...picked, i]); if (ex.type === 'build') speak(w); }}
              style={[s.tile, used && { backgroundColor: 'transparent', borderWidth: 1, shadowOpacity: 0 }]} accessibilityLabel={w}>
              <T style={[s.tileText, used && { color: 'transparent' }]}>{w}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TypeView({ ex, locked, onChange, showHintNote }: Props & { ex: Extract<Exercise, { type: 'type' }> }) {
  const a = useAccent();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 22 }}>
      <Head cat="წერა" title="დაწერე ინგლისურად" sub="აკრიფე წინადადების თარგმანი." />
      <GeorgianPrompt ex={ex} showHintNote={showHintNote} />
      <TextInput editable={!locked} multiline autoCapitalize="sentences" autoCorrect={false} placeholder="დაწერე აქ…" placeholderTextColor={colors.muted}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChangeText={(t) => onChange(t.trim() ? { kind: 'text', value: t } : null)} accessibilityLabel="შენი თარგმანი"
        style={[s.input, focus && { borderColor: a.acc }]} />
    </View>
  );
}

function FillView({ ex, locked, onChange }: Props & { ex: Extract<Exercise, { type: 'fill' }> }) {
  const a = useAccent();
  const [sel, setSel] = useState<string | null>(null);
  const before = ex.tokens.slice(0, ex.blank).join(' '), after = ex.tokens.slice(ex.blank + 1).join(' ');
  return (
    <View style={{ gap: 22 }}>
      <Head cat="გრამატიკა" title="შეავსე გამოტოვებული სიტყვა" sub="რომელი სიტყვა აკლია წინადადებას?" />
      <View style={[s.card, { padding: 18, gap: 6 }]}>
        <T style={{ fontFamily: fonts.en, fontSize: 21, lineHeight: 34 }}>
          {before} <T style={{ fontFamily: fonts.enBold, fontSize: 21, color: a.acc, textDecorationLine: 'underline' }}>{sel ?? ' _____ '}</T>{ex.tail} {after}
        </T>
        <T v="small">{ex.p.ka}</T>
      </View>
      <Choices latin locked={locked} options={ex.options.map((o) => ({ key: o, label: o }))} onPick={(k) => { setSel(k); onChange({ kind: 'option', value: k }); }} />
    </View>
  );
}

function ReplyView({ ex, locked, onChange }: Props & { ex: Extract<Exercise, { type: 'reply' }> }) {
  const a = useAccent();
  const [peek, setPeek] = useState(false);
  useEffect(() => { const t = setTimeout(() => speak(ex.prompt.en), 300); return () => clearTimeout(t); }, [ex]);
  const who = CHARACTERS[ex.prompt.speaker];
  return (
    <View style={{ gap: 18 }}>
      <Head cat="საუბარი" title={`უპასუხე: ${who.name}`} sub={`შენ ხარ ${CHARACTERS[ex.unit.host].name}. აირჩიე შესაფერისი პასუხი.`} />
      <Speaker who={ex.prompt.speaker} onListen={() => speak(ex.prompt.en)}>
        <T v="en" style={{ fontSize: 18, lineHeight: 26 }}>{ex.prompt.en}</T>
        {peek && <T v="small" style={{ marginTop: 6 }}>{ex.prompt.ka}</T>}
      </Speaker>
      <Pressable onPress={() => setPeek(!peek)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} accessibilityRole="button">
        <Icon name="eye" size={16} color={a.acc} /><T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: a.acc }}>{peek ? 'თარგმანის დამალვა' : 'თარგმანის ჩვენება'}</T>
      </Pressable>
      <Choices latin locked={locked} options={ex.options.map((o) => ({ key: o.id, label: o.en }))} onPick={(k) => onChange({ kind: 'option', value: k })} />
    </View>
  );
}

function MatchView({ ex, onChange, onMatchMiss }: Props & { ex: Extract<Exercise, { type: 'match' }> }) {
  const a = useAccent();
  const left = useMemo(() => shuffle(ex.pairs), [ex]);
  const right = useMemo(() => shuffle(ex.pairs), [ex]);
  const [l, setL] = useState<string | null>(null), [r, setR] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]), [wrong, setWrong] = useState<string[]>([]);
  const tap = (id: string, label: string, side: 'l' | 'r') => {
    if (side === 'r') speak(label);
    const nl = side === 'l' ? id : l, nr = side === 'r' ? id : r;
    if (!nl || !nr) { setL(nl); setR(nr); return; }
    setL(null); setR(null);
    if (nl === nr) { const g = [...gone, nl]; setGone(g); if (g.length === ex.pairs.length) onChange({ kind: 'match' }); }
    else { setWrong([nl, nr]); onMatchMiss?.(); setTimeout(() => setWrong([]), 500); }
  };
  const cell = (id: string, label: string, side: 'l' | 'r') => {
    const sel = side === 'l' ? l === id : r === id, isGone = gone.includes(id), bad = wrong.includes(id);
    return (
      <Pressable key={side + id} disabled={isGone} onPress={() => tap(id, label, side)}
        style={[s.match, sel && { backgroundColor: a.soft, borderColor: a.acc }, bad && { borderColor: colors.error, backgroundColor: colors.errorSoft }, isGone && { opacity: 0.3 }]}>
        <T style={{ fontSize: 16, fontFamily: side === 'r' ? fonts.enBold : fonts.ka }}>{label}</T>
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 22 }}>
      <Head cat="წყვილები" title="შეაერთე წყვილები" sub="იპოვე სიტყვა და მისი თარგმანი." />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 12 }}>{left.map((v) => cell(v.id, v.ka, 'l'))}</View>
        <View style={{ flex: 1, gap: 12 }}>{right.map((v) => cell(v.id, v.en, 'r'))}</View>
      </View>
    </View>
  );
}

function ListenButton({ onPress, big, label }: { onPress: () => void; big?: boolean; label?: string }) {
  const a = useAccent();
  return (
    <Pressable onPress={onPress} accessibilityLabel={label ? 'ნელა მოსმენა' : 'მოსმენა'}
      style={{ width: big ? 96 : 56, height: big ? 84 : 56, borderRadius: big ? 24 : 18, backgroundColor: a.soft, borderWidth: 1, borderColor: a.dk, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Icon name="volume-2" size={big ? 38 : 22} color={a.acc} />
      {label && <T style={{ fontSize: 10, fontFamily: fonts.kaBold, color: a.acc }}>{label}</T>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.xl },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 62, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.lg,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 5 },
  key: { width: 31, height: 31, borderRadius: 9, backgroundColor: colors.sunk, alignItems: 'center', justifyContent: 'center' },
  tile: { height: 46, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.raised, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, justifyContent: 'center' },
  tileText: { fontFamily: fonts.enBold, fontSize: 18, color: colors.ink },
  input: { minHeight: 130, borderWidth: 2, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.raised, color: colors.ink,
    padding: 14, fontFamily: fonts.en, fontSize: 18, textAlignVertical: 'top' },
  match: { minHeight: 56, padding: 10, borderRadius: 14, backgroundColor: colors.raised, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, justifyContent: 'center' },
});
