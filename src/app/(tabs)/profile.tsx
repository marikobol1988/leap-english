import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Button } from '../../components/Button';
import { T } from '../../components/Text';
import { Card, Header, Screen, Stat } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useAccent, useProgress } from '../../lib/progress';
import type { Profile } from '../../lib/types';
import { accents, colors, fonts, type AccentName } from '../../theme';

const GOALS: [string, string, Profile['daily_goal_xp']][] = [['მსუბუქი', '5 წთ', 10], ['ჩვეულებრივი', '10 წთ', 20], ['სერიოზული', '15 წთ', 30], ['ინტენსიური', '20 წთ', 50]];
const ACCENTS: [AccentName, string][] = [['yellow', 'ყვითელი'], ['blue', 'ცისფერი'], ['orange', 'ნარინჯისფერი']];

export default function ProfileTab() {
  const a = useAccent();
  const { session, signOut } = useAuth();
  const { profile, stats, updateProfile, resetProgress, deleteAccount } = useProgress();
  const [busy, setBusy] = useState(false);
  if (!profile || !stats) return null;

  const confirm = (title: string, msg: string, action: () => Promise<void>) =>
    Alert.alert(title, msg, [{ text: 'გაუქმება', style: 'cancel' }, { text: 'დიახ', style: 'destructive', onPress: async () => { setBusy(true); try { await action(); } finally { setBusy(false); } } }]);

  return (
    <Screen>
      <Header />
      <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 23 }}>პროფილი</T>
      <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: a.acc, alignItems: 'center', justifyContent: 'center' }}>
          <T style={{ fontFamily: fonts.enBold, fontSize: 26, color: a.on }}>{(profile.display_name || '?').charAt(0).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1 }}><T v="h3" style={{ fontSize: 19 }}>{profile.display_name}</T><T v="small">{session?.user.email}</T></View>
      </Card>
      <Card style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
        <Stat icon="flame" color={colors.coral} value={stats.streak_current} label="დღის სერია" />
        <Stat icon="gem" color={colors.sky} value={stats.gems} label="ბრილიანტი" />
        <Stat icon="heart" color={colors.error} value={stats.hearts} label="სიცოცხლე" />
        <View><T style={{ fontFamily: fonts.enBold, fontSize: 17 }}>{stats.xp_total}</T><T v="caption">XP</T></View>
      </Card>

      <T v="h3">დღიური მიზანი</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {GOALS.map(([name, mins, xp]) => {
          const on = profile.daily_goal_xp === xp;
          return (
            <Pressable key={xp} onPress={() => updateProfile({ daily_goal_xp: xp })} accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={{ width: '48%', flexGrow: 1, padding: 12, borderRadius: 16, borderWidth: 2, borderColor: on ? a.acc : colors.line, backgroundColor: on ? a.soft : colors.surface }}>
              <T style={{ fontFamily: fonts.kaBold, fontSize: 14 }}>{name}</T><T v="caption">{mins} · {xp} XP</T>
            </Pressable>
          );
        })}
      </View>

      <T v="h3">აპის ფერი</T>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {ACCENTS.map(([k, n]) => (
          <Pressable key={k} onPress={() => updateProfile({ accent: k })} accessibilityRole="radio" accessibilityState={{ selected: profile.accent === k }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, borderWidth: 2, borderColor: profile.accent === k ? colors.ink : colors.line }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: accents[k].acc }} /><T style={{ fontSize: 13, fontFamily: fonts.kaBold }}>{n}</T>
          </Pressable>
        ))}
      </View>

      <T v="h3">ანგარიში</T>
      <Button kind="quiet" small label="გასვლა" onPress={signOut} disabled={busy} />
      <Button kind="quiet" small label="პროგრესის წაშლა" disabled={busy}
        onPress={() => confirm('პროგრესის წაშლა', 'XP, სერია და გაკვეთილები განულდება.', resetProgress)} />
      <Button kind="danger" small label="ანგარიშის წაშლა" disabled={busy}
        onPress={() => confirm('ანგარიშის წაშლა', 'ანგარიში და ყველა მონაცემი სამუდამოდ წაიშლება.', deleteAccount)} />
    </Screen>
  );
}
