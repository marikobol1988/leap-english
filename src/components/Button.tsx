import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAccent } from '../lib/progress';
import { colors, fonts, radius } from '../theme';
import { T } from './Text';

type Kind = 'primary' | 'quiet' | 'danger' | 'gold';
interface Props { label: string; onPress?: () => void; kind?: Kind; disabled?: boolean; icon?: React.ReactNode; style?: ViewStyle; small?: boolean }

/** The chunky 3D button from the Figma kit: a darker strip under the face that collapses on press. */
export function Button({ label, onPress, kind = 'primary', disabled, icon, style, small }: Props) {
  const a = useAccent();
  const face = disabled ? colors.sunk : kind === 'primary' ? a.acc : kind === 'danger' ? colors.error : kind === 'gold' ? colors.yellow : colors.surface;
  const edge = disabled ? colors.tileShadow : kind === 'primary' ? a.dk : kind === 'danger' ? colors.errorPressed : kind === 'gold' ? colors.yellowPressed : colors.tileShadow;
  const ink = disabled ? colors.muted : kind === 'primary' ? a.on : kind === 'danger' ? '#fff' : kind === 'gold' ? '#2A1D05' : colors.ink;
  const h = small ? 46 : 58;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[{ height: h + 4 }, style]}>
      {({ pressed }) => (
        <View style={[s.edge, { backgroundColor: edge, height: h, top: 4 }]}>
          <View style={[s.face, { backgroundColor: face, height: h, top: pressed && !disabled ? 0 : -4 },
            kind === 'quiet' && { borderWidth: 2, borderColor: colors.line }]}>
            {icon}
            <T style={{ fontFamily: fonts.kaBold, fontSize: small ? 14 : 16, color: ink }}>{label}</T>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  edge: { borderRadius: radius.lg },
  face: { position: 'absolute', left: 0, right: 0, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
