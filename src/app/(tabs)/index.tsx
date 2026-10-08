import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { LessonPath } from '../../components/LessonPath';
import { T } from '../../components/Text';
import { Card, Header, ProgressBar, Screen } from '../../components/ui';
import { SECTIONS, UNITS } from '../../content';
import { useAccent, useProgress } from '../../lib/progress';
import { colors, fonts } from '../../theme';

export default function Learn() {
  const a = useAccent();
  const profile = useProgress((s) => s.profile);
  const today = useProgress((s) => s.today);
  const goal = profile?.daily_goal_xp ?? 20, xp = today?.xp ?? 0;
  const name = (profile?.display_name || 'მეგობარო').split(' ')[0];

  return (
    <Screen>
      <Header />
      <View>
        <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 23 }}>გამარჯობა, {name}!</T>
        <T v="small">ყოველი ნახტომი წინსვლაა.</T>
      </View>
      <Card style={{ padding: 12, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T style={{ fontSize: 13 }}>დღიური მიზანი</T>
          <T style={{ fontFamily: fonts.enBold, fontSize: 13, color: a.acc }}>{Math.min(xp, goal)} / {goal} XP</T>
        </View>
        <ProgressBar value={xp / goal} />
      </Card>

      {SECTIONS.map((sec) => (
        <View key={sec.id} style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 }}>
            <View style={{ backgroundColor: sec.locked ? colors.sunk : a.acc, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <T style={{ fontFamily: fonts.enBold, fontSize: 11, color: sec.locked ? colors.muted : a.on }}>{sec.cefr}</T>
            </View>
            <T v="small">სექცია {sec.position} · {sec.name}</T>
          </View>
          {sec.locked
            ? sec.comingSoon?.map((c) => (
                <Card key={c.en} style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}><T v="caption">მალე</T><T v="h3" style={{ color: colors.muted }}>{c.ka}</T></View>
                  <Icon name="lock" color={colors.muted} />
                </Card>
              ))
            : UNITS.filter((u) => u.sectionId === sec.id).map((u) => (
                <View key={u.id} style={{ gap: 6 }}>
                  <View style={{ backgroundColor: colors.banner, borderRadius: 18, padding: 14, paddingLeft: 16, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <T style={{ fontSize: 11, color: colors.bannerSub }}>სექცია {sec.position} • თავი {UNITS.indexOf(u) + 1}</T>
                      <T v="h3" style={{ color: '#fff', fontSize: 17 }}>{u.ka}</T>
                    </View>
                    <Pressable onPress={() => router.push({ pathname: '/guide/[unitId]', params: { unitId: u.id } })} accessibilityLabel={`გზამკვლევი: ${u.ka}`}
                      style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="book-open" size={24} color="#fff" />
                    </Pressable>
                  </View>
                  <LessonPath unitId={u.id} />
                </View>
              ))}
        </View>
      ))}
    </Screen>
  );
}
