import { router } from 'expo-router';
import { View } from 'react-native';
import { Button } from '../../components/Button';
import { Tari } from '../../components/Tari';
import { T } from '../../components/Text';
import { Logo, Screen } from '../../components/ui';

export default function Welcome() {
  return (
    <Screen style={{ gap: 18, padding: 24 }}>
      <View style={{ alignItems: 'center', paddingTop: 12 }}><Logo /></View>
      <View style={{ alignItems: 'center' }}><Tari width={200} mood="cheer" /></View>
      <View style={{ gap: 8 }}>
        <T v="h1" style={{ textAlign: 'center' }}>ინგლისური ყოველდღიური ნახტომებით</T>
        <T v="small" style={{ textAlign: 'center' }}>კაფე, სასტუმრო, აეროპორტი, ექიმი. მოკლე გაკვეთილები, ქართველი პერსონაჟები და ახსნები ქართულად. შენი მეგზური ტარია.</T>
      </View>
      <Button label="დავიწყოთ" onPress={() => router.push('/onboarding')} />
      <Button kind="quiet" label="უკვე მაქვს ანგარიში" onPress={() => router.push('/sign-in')} />
      <T v="caption" style={{ textAlign: 'center' }}>ილუსტრაციები: Microsoft Fluent Emoji (MIT)</T>
    </Screen>
  );
}
