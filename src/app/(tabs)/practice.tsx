import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Tari } from '../../components/Tari';
import { T } from '../../components/Text';
import { Card, Header, Screen } from '../../components/ui';
import { CHARACTERS, unlockedUnits, type CharacterId } from '../../content';
import type { PracticeMode } from '../../engine/exercises';
import { useAccent, useProgress } from '../../lib/progress';
import { colors, fonts } from '../../theme';

const MODES: { mode: PracticeMode; title: string; sub: string; icon: 'star' | 'headphones' | 'edit-2' | 'align-left'; tint: string }[] = [
  { mode: 'words', title: 'სიტყვები', sub: 'სურათები და წყვილები', icon: 'star', tint: colors.sky },
  { mode: 'listen', title: 'მოსმენა', sub: 'გაიგე და ააწყვე', icon: 'headphones', tint: colors.coral },
  { mode: 'write', title: 'წერა', sub: 'აკრიფე თარგმანი', icon: 'edit-2', tint: colors.success },
  { mode: 'build', title: 'წინადადებები', sub: 'ააწყვე და შეავსე', icon: 'align-left', tint: colors.yellow },
];

const go = (mode: PracticeMode, unitId?: string) =>
  router.push({ pathname: '/session', params: { kind: 'practice', mode, ...(unitId ? { unitId } : {}) } });

export default function Practice() {
  const a = useAccent();
  const done = useProgress((s) => s.done);
  const hearts = useProgress((s) => s.stats?.hearts ?? 0);
  const misses = useProgress((s) => s.mistakes.length);
  const units = unlockedUnits(done);

  return (
    <Screen>
      <Header />
      <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 23 }}>ვარჯიში</T>
      <T v="small" style={{ marginTop: -8 }}>ვარჯიში სიცოცხლეს არ ხარჯავს. ყოველი სესია გაძლევს +5 XP-ს და აღგიდგენს 1 სიცოცხლეს.</T>

      <Card style={{ padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 24 }}>
        <Tari width={92} mood="think" />
        <View style={{ flex: 1, gap: 6 }}>
          <T v="h3" style={{ fontSize: 19 }}>სწრაფი ვარჯიში</T>
          <T v="small">8 სხვადასხვა სავარჯიშო {units.length} გახსნილი თავიდან.</T>
          <T v="caption" style={{ color: colors.coral }}>♥ {hearts} / 5   ·   +5 XP   ·   4 წთ</T>
          <Button small label="დაწყება" onPress={() => go('quick')} />
        </View>
      </Card>

      <T v="h3" style={{ marginTop: 10 }}>აირჩიე უნარი</T>
      <Pressable disabled={!misses} onPress={() => go('mistakes')} style={{ opacity: misses ? 1 : 0.5 }}>
        <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="rotate-ccw" color={colors.error} /></View>
          <View style={{ flex: 1 }}><T style={{ fontFamily: fonts.kaBold }}>შეცდომების გამეორება</T><T v="caption">{misses ? 'სიტყვები და ფრაზები, სადაც შეცდი' : 'შეცდომები აქ გამოჩნდება'}</T></View>
          {!!misses && <T style={{ fontFamily: fonts.enBold, color: colors.error }}>{misses}</T>}
        </Card>
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {MODES.map((m) => (
          <Pressable key={m.mode} onPress={() => go(m.mode)} style={{ width: '48%', flexGrow: 1 }}>
            <Card style={{ padding: 14, gap: 8, minHeight: 118 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.sunk, alignItems: 'center', justifyContent: 'center' }}><Icon name={m.icon} color={m.tint} /></View>
              <T style={{ fontFamily: fonts.kaBold }}>{m.title}</T><T v="caption">{m.sub}</T>
            </Card>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => go('talk')}>
        <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: a.soft, alignItems: 'center', justifyContent: 'center' }}><Icon name="users" color={a.acc} /></View>
          <View style={{ flex: 1 }}><T style={{ fontFamily: fonts.kaBold }}>საუბარი პერსონაჟებთან</T><T v="caption">ტომი, ემა, ჯეიმსი და სხვები გელაპარაკებიან. შენ უპასუხე.</T></View>
          <Avatar id="emma" size={40} />
        </Card>
      </Pressable>

      <T v="h3" style={{ marginTop: 10 }}>თავების მიხედვით</T>
      <Card>
        {units.map((u, i) => (
          <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
            <Avatar id={u.host} size={40} />
            <View style={{ flex: 1 }}><T style={{ fontFamily: fonts.kaBold, fontSize: 14 }}>{i + 1}. {u.ka}</T><T v="caption">{u.en} · {CHARACTERS[u.host].name} და {CHARACTERS[u.partner].name}</T></View>
            <Pressable onPress={() => go('unit', u.id)} style={{ height: 38, paddingHorizontal: 14, borderRadius: 12, backgroundColor: a.soft, justifyContent: 'center' }}>
              <T style={{ fontFamily: fonts.kaBold, fontSize: 13, color: a.acc }}>ვარჯიში</T>
            </Pressable>
          </View>
        ))}
      </Card>

      <T v="h3" style={{ marginTop: 10 }}>გაიცანი პერსონაჟები</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
          <Card key={id} style={{ width: 142, padding: 12, alignItems: 'center', gap: 6 }}>
            <Avatar id={id} size={58} /><T style={{ fontFamily: fonts.kaBold, fontSize: 14 }}>{CHARACTERS[id].name}</T>
            <T v="caption" style={{ textAlign: 'center' }}>{CHARACTERS[id].bio}</T>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
