import { useState } from 'react';
import { View } from 'react-native';
import { hintTokens } from '../engine/hints';
import { useAccent } from '../lib/progress';
import { colors, fonts } from '../theme';
import { T } from './Text';

/**
 * A Georgian sentence where every known word is underlined. Tapping a word shows its English hint
 * in a small bubble above the sentence (the mobile version of the prototype's hover tooltip).
 */
export function HintSentence({ text, size = 20 }: { text: string; size?: number }) {
  const a = useAccent();
  const tokens = hintTokens(text);
  const [open, setOpen] = useState<number | null>(null);
  const shown = open !== null ? tokens[open] : null;
  return (
    <View>
      {shown?.hint && (
        <View style={{ alignSelf: 'flex-start', backgroundColor: a.shine, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 6 }} accessibilityLiveRegion="polite">
          <T style={{ fontFamily: fonts.enBold, fontSize: 14, color: '#0A0E13' }}>{shown.text} → {shown.hint}</T>
        </View>
      )}
      <T style={{ fontSize: size, lineHeight: size * 1.6 }}>
        {tokens.map((t, i) => t.hint ? (
          <T key={i} onPress={() => setOpen(open === i ? null : i)} accessibilityRole="button" accessibilityHint={t.hint}
            style={{ fontSize: size, lineHeight: size * 1.6, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: a.acc,
              backgroundColor: open === i ? a.soft : 'transparent', color: colors.ink }}>{t.text}</T>
        ) : <T key={i} style={{ fontSize: size, lineHeight: size * 1.6 }}>{t.text}</T>)}
      </T>
    </View>
  );
}
