import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Tari } from '../../components/Tari';
import { T } from '../../components/Text';
import { Card } from '../../components/ui';
import { CHARACTERS, nodeById, unitById } from '../../content';
import { previewXp } from '../../engine/grading';
import { useAccent, useProgress } from '../../lib/progress';
import { colors, fonts } from '../../theme';

/** Lesson introduction (Figma: "Lesson introduction"). */
export default function LessonIntro() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const a = useAccent();
  const done = useProgress((s) => s.done);
  const hearts = useProgress((s) => s.stats?.hearts ?? 0);
  const node = nodeById(nodeId);
  if (!node) return null;
  const u = unitById(node.unitId), review = node.kind === 'review';
  const xp = previewXp(review ? 'review' : 'lesson', { replay: done.has(node.id), perfect: false });
  const start = () => hearts <= 0
    ? router.replace('/out-of-hearts')
    : router.replace({ pathname: '/session', params: { kind: review ? 'review' : 'lesson', nodeId: node.id } });

  const rows: [React.ReactNode, string, string][] = [
    [<Icon key="i1" name="star" color={a.acc} />, 'ახალი სიტყვები', `${u.vocab.slice(0, 3).map((v) => v.en).join(', ')} და სხვა`],
    [<Icon key="i2" name="volume-2" color={a.acc} />, 'მოსმენა და გამოთქმა', 'მოუსმინე და გაიმეორე'],
    [<Icon key="i3" name="message-circle" color={a.acc} />, 'მარტივი წინადადება', u.phrases[0].en],
    [<Avatar key="i4" id={u.host} size={40} />, `${CHARACTERS[u.host].name} და ${CHARACTERS[u.partner].name}`, u.scene],
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="უკან"><Icon name="arrow-left" size={24} color={colors.muted} /></Pressable>
        <T v="small">{review ? 'თავის გამეორება' : `გაკვეთილი ${node.lessonNumber}`}</T>
        <Pressable onPress={() => router.push({ pathname: '/guide/[unitId]', params: { unitId: u.id } })} accessibilityLabel="გზამკვლევი"><Icon name="more-horizontal" size={24} color={colors.muted} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 18, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <Tari width={176} mood={review ? 'cheer' : 'happy'} />
          <View style={{ position: 'absolute', right: 10, top: 30, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
            <T style={{ fontFamily: fonts.en, fontSize: 17, color: '#0A0E13' }}>{u.vocab[0].en.charAt(0).toUpperCase() + u.vocab[0].en.slice(1)}!</T>
          </View>
          <View style={{ position: 'absolute', left: 4, top: 140, backgroundColor: a.shine, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 }}>
            <T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: '#0A0E13' }}>{u.vocab[0].ka}!</T>
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <T v="h1" style={{ fontFamily: fonts.ka, fontSize: 28, textAlign: 'center' }}>{u.ka}</T>
          <T v="small" style={{ textAlign: 'center', maxWidth: 300 }}>{review ? 'გაიმეორე თავის ყველა ფრაზა და დიალოგი ერთ გაკვეთილში.' : `ისწავლე ${u.vocab.length} სიტყვა და ააწყვე წინადადებები სიტუაციისთვის „${u.ka}“.`}</T>
        </View>
        <Card style={{ padding: 16, gap: 14, borderRadius: 24 }}>
          {rows.map(([icon, title, sub]) => (
            <View key={title} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: a.soft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{icon}</View>
              <View style={{ flex: 1 }}><T style={{ fontSize: 14 }}>{title}</T><T v="caption">{sub}</T></View>
            </View>
          ))}
        </Card>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
          <T v="small">{review ? 5 : 3} წუთი</T><T v="small" style={{ color: a.acc }}>+{xp} XP</T><T v="small" style={{ color: colors.error }}>♥ {hearts}</T>
        </View>
      </ScrollView>
      <View style={{ padding: 24, paddingTop: 12 }}><Button label="დავიწყოთ" onPress={start} /></View>
    </SafeAreaView>
  );
}
