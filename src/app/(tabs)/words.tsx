import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { Card, Header, Screen } from '../../components/ui';
import { unlockedUnits } from '../../content';
import { IMAGES } from '../../content/images';
import { useAccent, useProgress } from '../../lib/progress';
import { speak } from '../../lib/speech';
import { colors, fonts } from '../../theme';

export default function Words() {
  const a = useAccent();
  const done = useProgress((s) => s.done);
  return (
    <Screen>
      <Header />
      <T v="h2" style={{ fontFamily: fonts.ka, fontSize: 23 }}>სიტყვები</T>
      <T v="small" style={{ marginTop: -8 }}>თავების სიტყვები, რომლებიც უკვე გაიხსნა.</T>
      {unlockedUnits(done).map((u, ui) => (
        <Card key={u.id} style={{ overflow: 'hidden' }}>
          <View style={{ backgroundColor: colors.banner, padding: 12, paddingHorizontal: 16 }}><T style={{ fontFamily: fonts.kaBold, fontSize: 13, color: '#fff' }}>თავი {ui + 1} · {u.ka}</T></View>
          {u.vocab.map((v) => (
            <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingHorizontal: 16, borderTopWidth: 1, borderColor: colors.line }}>
              <Image source={IMAGES[v.image]} style={{ width: 40, height: 40 }} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <T style={{ fontFamily: fonts.enBold, fontSize: 16 }}>{v.en} <T v="caption" style={{ fontFamily: fonts.en }}>{v.phonetic}</T></T>
                <T v="small">{v.ka}</T>
              </View>
              <Pressable onPress={() => speak(v.en)} accessibilityLabel={`მოსმენა: ${v.en}`} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: a.soft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="volume-2" size={20} color={a.acc} />
              </Pressable>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
