import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useAccent } from '../lib/progress';
import { colors, fonts } from '../theme';
import { T } from './Text';

export function Field({ label, secure, ...rest }: TextInputProps & { label: string; secure?: boolean }) {
  const a = useAccent();
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <T style={{ fontFamily: fonts.kaBold, fontSize: 13 }}>{label}</T>
      <View>
        <TextInput {...rest} accessibilityLabel={label} secureTextEntry={secure && !show} placeholderTextColor={colors.muted}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ height: 52, borderWidth: 2, borderRadius: 14, borderColor: focus ? a.acc : colors.line, backgroundColor: colors.raised,
            color: colors.ink, paddingHorizontal: 14, paddingRight: secure ? 92 : 14, fontFamily: fonts.ka, fontSize: 16 }} />
        {secure && (
          <Pressable onPress={() => setShow(!show)} style={{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', padding: 6 }} accessibilityRole="button">
            <T style={{ fontFamily: fonts.kaBold, fontSize: 13, color: a.acc }}>{show ? 'დამალვა' : 'ჩვენება'}</T>
          </Pressable>
        )}
      </View>
    </View>
  );
}
