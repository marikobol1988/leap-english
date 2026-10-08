import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccent, useProgress } from '../lib/progress';
import { colors, radius } from '../theme';
import { Icon } from './Icon';
import { T } from './Text';
import { TariFace } from './Tari';

export function Screen({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: ViewStyle }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {scroll
        ? <ScrollView contentContainerStyle={[{ padding: 22, gap: 14, paddingBottom: 40 }, style]}>{children}</ScrollView>
        : <View style={[{ flex: 1 }, style]}>{children}</View>}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function ProgressBar({ value, height = 10 }: { value: number; height?: number }) {
  const a = useAccent();
  return (
    <View style={{ height, backgroundColor: colors.sunk, borderRadius: radius.pill, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ now: Math.round(value * 100), min: 0, max: 100 }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: a.acc, borderRadius: radius.pill }} />
    </View>
  );
}

export function Logo() {
  const a = useAccent();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: a.acc, alignItems: 'center', justifyContent: 'center' }}><TariFace size={30} /></View>
      <View><T v="brand">Leap</T><T style={{ fontSize: 9.5, color: a.acc, fontFamily: 'NotoSansGeorgian_500Medium' }}>ინგლისური ნახტომებით</T></View>
    </View>
  );
}

/** Logo + streak + gems, as in the Figma "Learning home" frame. */
export function Header() {
  const stats = useProgress((st) => st.stats);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Logo />
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Stat icon="flame" color={colors.coral} value={stats?.streak_current ?? 0} label="დღეების სერია" />
        <Stat icon="gem" color={colors.sky} value={stats?.gems ?? 0} label="ბრილიანტები" />
      </View>
    </View>
  );
}
export function Stat({ icon, color, value, label }: { icon: 'flame' | 'gem' | 'heart'; color: string; value: number; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={21} color={color} /><T style={{ fontFamily: 'Inter_500Medium', fontSize: 17, color: colors.ink }}>{value}</T>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg },
});
