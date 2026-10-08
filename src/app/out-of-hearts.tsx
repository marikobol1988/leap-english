import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Tari } from '../components/Tari';
import { T } from '../components/Text';
import { useProgress } from '../lib/progress';
import { colors } from '../theme';

export default function OutOfHearts() {
  const gems = useProgress((s) => s.stats?.gems ?? 0);
  const refill = useProgress((s) => s.refillHearts);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center', gap: 12, marginTop: 40 }}>
        <Tari width={160} mood="sad" />
        <T v="h1" style={{ textAlign: 'center' }}>სიცოცხლეები ამოიწურა</T>
        <T v="small" style={{ textAlign: 'center' }}>შეავსე ბრილიანტებით ან გაიარე მოკლე ვარჯიში. ვარჯიში სიცოცხლეს არ ხარჯავს და ერთს აღგიდგენს.</T>
      </View>
      <View style={{ gap: 14 }}>
        <Button kind="gold" label="შევსება · 50 ბრილიანტი" disabled={gems < 50}
          onPress={async () => { try { await refill(); router.back(); } catch (e) { Alert.alert('ვერ შეივსო', String(e)); } }} />
        <Button label="ვარჯიში" onPress={() => router.replace({ pathname: '/session', params: { kind: 'practice', mode: 'quick' } })} />
        <Button kind="quiet" label="მოგვიანებით" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
