import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ExerciseView } from '../components/exercises/ExerciseView';
import { Icon } from '../components/Icon';
import { Tari } from '../components/Tari';
import { T } from '../components/Text';
import { Card, ProgressBar } from '../components/ui';
import { nodeById, unitById, unlockedUnits } from '../content';
import { SEQUENCES, buildSession, mistakesSession, type Exercise, type PracticeMode, type SessionKind } from '../engine/exercises';
import { grade, type Answer, type Grade } from '../engine/grading';
import { useAccent, useProgress } from '../lib/progress';
import { stopSpeaking } from '../lib/speech';
import type { AnswerEvent, SessionResult } from '../lib/types';
import { colors, fonts } from '../theme';

const CHEERS_OK = ['სწორია!', 'ყოჩაღ!', 'შესანიშნავია!'];

/**
 * Runs a lesson, review or practice session.
 * Params: kind=lesson|review (with nodeId) or kind=practice (with mode, optional unitId).
 */
export default function SessionScreen() {
  const params = useLocalSearchParams<{ kind: SessionKind; nodeId?: string; mode?: PracticeMode; unitId?: string }>();
  const a = useAccent();
  const { done, mistakes, stats, profile, completeSession, loseHeart } = useProgress();
  const kind = params.kind ?? 'practice';
  const practice = kind === 'practice';

  const { units, initial } = useMemo(() => {
    if (!practice) {
      const unit = unitById(nodeById(params.nodeId!)!.unitId);
      return { units: [unit], initial: buildSession([unit], SEQUENCES[kind], { canSpeak: true }) };
    }
    const mode = params.mode ?? 'quick';
    const us = params.unitId ? [unitById(params.unitId)] : unlockedUnits(done);
    const ex = mode === 'mistakes' ? mistakesSession(mistakes) : buildSession(us, SEQUENCES[mode], { canSpeak: true });
    return { units: us, initial: ex };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [step, setStep] = useState(0);           // increments per shown exercise, used as React key
  const [solved, setSolved] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<Grade | null>(null);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState<SessionResult | null>(null);
  const [saving, setSaving] = useState(false);
  const events = useRef<AnswerEvent[]>([]);
  const startedAt = useRef(new Date());
  const total = initial.length;
  const ex = queue[0];

  useEffect(() => () => { stopSpeaking(); }, []);
  useEffect(() => { if (!initial.length) { Alert.alert('შეცდომები ჯერ არ გაქვს'); router.back(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const record = (e: Exercise, correct: boolean) =>
    events.current.push({ exercise_type: e.type, item_type: e.itemType, item_id: e.itemId, correct });

  const check = async (a: Answer | null = answer) => {
    if (!ex || !a) return;
    const g = grade(ex, a);
    record(ex, g.correct);
    setFeedback(g);
    setCombo(g.correct ? combo + 1 : 0);
    if (!g.correct && !practice) {
      try { await loseHeart(); } catch { /* offline: the server still re-checks hearts at the end */ }
    }
  };

  const next = async () => {
    const ok = feedback?.correct;
    const rest = queue.slice(1);
    const nextQueue = ok ? rest : [...rest, ex];  // wrong answers come back at the end
    if (ok) setSolved(solved + 1);
    setFeedback(null); setAnswer(null);
    if (!practice && (useProgress.getState().stats?.hearts ?? 1) <= 0) { router.replace('/out-of-hearts'); return; }
    if (nextQueue.length) { setQueue(nextQueue); setStep(step + 1); return; }
    setSaving(true);
    try {
      const res = await completeSession({
        kind, nodeId: params.nodeId, mode: practice ? params.mode ?? 'quick' : undefined,
        unitIds: units.map((u) => u.id), answers: events.current, startedAt: startedAt.current,
      });
      setFinished(res);
    } catch (e) {
      Alert.alert('შედეგი ვერ შეინახა', 'შეამოწმე ინტერნეტი და სცადე თავიდან.', [{ text: 'თავიდან ცდა', onPress: next }, { text: 'დახურვა', onPress: () => router.back() }]);
      console.warn(e);
    } finally { setSaving(false); }
  };

  if (finished) return <Results result={finished} practice={practice} goal={profile?.daily_goal_xp ?? 20} />;
  if (!ex) return null;

  const showHintNote = solved < 1;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, height: 58, paddingHorizontal: 24 }}>
          <Pressable onPress={() => router.back()} accessibilityLabel="დახურვა"><Icon name="x" size={22} color={colors.muted} /></Pressable>
          <View style={{ flex: 1 }}><ProgressBar value={Math.max(0.04, solved / total)} height={12} /></View>
          {!practice && <T style={{ fontFamily: fonts.enBold, fontSize: 13, color: colors.coral }}>♥ {stats?.hearts ?? 0}</T>}
          <T style={{ fontFamily: fonts.enBold, fontSize: 13, color: colors.muted }}>{Math.min(solved + 1, total)} / {total}</T>
        </View>
        {combo >= 3 && <T style={{ paddingHorizontal: 24, fontSize: 11, fontFamily: fonts.kaBold, color: colors.coral }}>{combo} ზედიზედ სწორი</T>}
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
          <ExerciseView key={step} ex={ex} locked={!!feedback} showHintNote={showHintNote}
            onChange={(ans) => { setAnswer(ans); if (ans?.kind === 'match') check(ans); }}
            onMatchMiss={() => record(ex, false)} />
        </ScrollView>
        <View style={{ padding: 24, paddingTop: 15, gap: 14, borderTopWidth: 1, borderColor: feedback ? colors.line : 'transparent',
          backgroundColor: !feedback ? 'transparent' : feedback.correct ? '#1E1A0E' : colors.errorSoft }}>
          {feedback && (
            <View style={{ flexDirection: 'row', gap: 12 }} accessibilityLiveRegion="polite">
              <View style={{ width: 35, height: 35, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: feedback.correct ? a.acc : colors.error }}>
                <Icon name={feedback.correct ? 'check' : 'x'} size={20} color={feedback.correct ? a.on : '#fff'} />
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontSize: 19, color: feedback.correct ? a.acc : colors.error }}>{feedback.correct ? CHEERS_OK[step % 3] : 'არასწორია'}</T>
                <T style={{ fontSize: 12, fontFamily: fonts.kaMedium, color: feedback.correct ? a.acc : colors.error }}>{feedback.message}</T>
              </View>
            </View>
          )}
          {saving ? <ActivityIndicator color={a.acc} />
            : feedback ? <Button label={feedback.correct ? 'გაგრძელება' : 'გასაგებია'} kind={feedback.correct ? 'primary' : 'danger'} onPress={next} />
            : <Button label="შემოწმება" disabled={!answer || ex.type === 'match'} onPress={() => check()} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Results({ result, practice, goal }: { result: SessionResult; practice: boolean; goal: number }) {
  const a = useAccent();
  const name = (useProgress.getState().profile?.display_name || 'მეგობარო').split(' ')[0];
  const sub = practice ? (result.healed ? 'ვარჯიში დასრულდა, აღდგა 1 სიცოცხლე.' : 'ვარჯიში დასრულდა!') : result.perfect ? 'უშეცდომო გაკვეთილი!' : 'გაკვეთილი დასრულებულია!';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 18, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center' }}><Tari width={176} mood="cheer" /></View>
        <View style={{ alignItems: 'center' }}>
          <T v="h1" style={{ fontSize: 30, lineHeight: 42 }}>ყოჩაღ, {name}!</T>
          <T v="small" style={{ fontSize: 15 }}>{sub}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1, height: 94, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <T style={{ fontFamily: fonts.en, fontSize: 26 }}>+{result.xp_earned} XP</T><T v="caption" style={{ color: colors.coral }}>მიღებული ქულები</T>
          </Card>
          <Card style={{ flex: 1, height: 94, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <T style={{ fontFamily: fonts.en, fontSize: 26 }}>{result.accuracy}%</T><T v="caption" style={{ color: a.acc }}>სიზუსტე</T>
          </Card>
        </View>
        <Card style={{ padding: 16, gap: 4, borderRadius: 24 }}>
          <T v="h3">{result.stats.streak_current}-დღიანი სერია!</T>
          <T v="caption">დღესაც ერთი ნახტომით წინ.{result.quest_gems ? ` ქვესტებისთვის +${result.quest_gems} ბრილიანტი.` : ''}</T>
        </Card>
        <T v="small" style={{ textAlign: 'center', color: result.day_xp >= goal ? a.acc : colors.muted }}>
          {result.day_xp >= goal ? 'დღიური მიზანი შესრულებულია' : `დღიური მიზანი: ${result.day_xp} / ${goal} XP`}
        </T>
      </ScrollView>
      <View style={{ padding: 24 }}><Button label={practice ? 'ვარჯიშზე დაბრუნება' : 'მთავარზე დაბრუნება'} onPress={() => router.back()} /></View>
    </SafeAreaView>
  );
}

