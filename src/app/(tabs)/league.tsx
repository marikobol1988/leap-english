import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { T } from '../../components/Text';
import { Card, Header, ProgressBar, Screen } from '../../components/ui';
import { useAccent, useProgress } from '../../lib/progress';
import type { LeaderRow } from '../../lib/types';
import { colors, fonts } from '../../theme';

export default function League() {
  const a = useAccent();
  const leaderboard = useProgress((s) => s.leaderboard);
  const today = useProgress((s) => s.today);
  const profile = useProgress((s) => s.profile);
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  useFocusEffect(useCallback(() => { leaderboard().then(setRows).catch(() => setRows([])); }, [leaderboard]));
  const goal = profile?.daily_goal_xp ?? 20;
  const quests = [
    { name: `დააგროვე ${goal} XP`, cur: today?.xp ?? 0, goal, reward: 10 },
    { name: 'დაასრულე 2 გაკვეთილი', cur: today?.sessions ?? 0, goal: 2, reward: 10 },
    { name: 'ერთი გაკვეთილი უშეცდომოდ', cur: today?.perfect ?? 0, goal: 1, reward: 15 },
  ];
  return (
    <Screen>
      <Header />
      <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 23 }}>ლიგა</T>
      <T v="h3">დღიური ქვესტები</T>
      <Card>
        {quests.map((q, i) => (
          <View key={q.name} style={{ padding: 12, paddingHorizontal: 16, gap: 6, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T style={{ fontSize: 14 }}>{q.name}</T><T v="caption">+{q.reward} ბრილიანტი</T></View>
            <ProgressBar value={q.cur / q.goal} />
          </View>
        ))}
      </Card>
      <T v="h3">ამ კვირის რეიტინგი</T>
      <Card>
        {rows === null ? <T v="small" style={{ padding: 16 }}>იტვირთება…</T>
          : rows.length === 0 ? <T v="small" style={{ padding: 16 }}>ამ კვირაში ჯერ არავის უვარჯიშია. იყავი პირველი!</T>
          : rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderColor: colors.line, backgroundColor: r.is_me ? a.soft : 'transparent' }}>
              <T style={{ width: 24, fontFamily: fonts.enBold, color: r.rank <= 3 ? a.acc : colors.muted }}>{r.rank}</T>
              <T style={{ flex: 1, fontFamily: r.is_me ? fonts.kaBold : fonts.ka }}>{r.display_name}{r.is_me ? ' (შენ)' : ''}</T>
              <T style={{ fontFamily: fonts.enBold }}>{r.xp} XP</T>
            </View>
          ))}
      </Card>
    </Screen>
  );
}
