import { Text as RNText, type TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption' | 'en' | 'enLarge' | 'brand';
const styles: Record<Variant, object> = {
  h1: { fontFamily: fonts.kaBold, fontSize: 26, lineHeight: 36, color: colors.ink },
  h2: { fontFamily: fonts.kaBold, fontSize: 21, lineHeight: 30, color: colors.ink },
  h3: { fontFamily: fonts.kaBold, fontSize: 16, lineHeight: 24, color: colors.ink },
  body: { fontFamily: fonts.ka, fontSize: 15, lineHeight: 23, color: colors.ink },
  small: { fontFamily: fonts.kaMedium, fontSize: 13, lineHeight: 19, color: colors.muted },
  caption: { fontFamily: fonts.kaMedium, fontSize: 11.5, lineHeight: 16, color: colors.muted },
  en: { fontFamily: fonts.en, fontSize: 16, lineHeight: 23, color: colors.ink },
  enLarge: { fontFamily: fonts.enBold, fontSize: 30, lineHeight: 38, color: colors.ink },
  brand: { fontFamily: fonts.brand, fontSize: 23, lineHeight: 26, color: colors.ink },
};

export function T({ v = 'body', style, ...rest }: TextProps & { v?: Variant }) {
  return <RNText {...rest} style={[styles[v], style]} />;
}
