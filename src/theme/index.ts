// Leap design tokens (Figma: "Leap · Styles & Icons")
export const colors = {
  bg: '#0A0E13',
  surface: '#141A22',
  raised: '#19212B',
  sunk: '#1C242E',
  line: '#26303C',
  tileShadow: '#070A0E',
  ink: '#F1F4F7',
  muted: '#A7B3C2',
  yellow: '#F2C14E',
  yellowPressed: '#B38424',
  yellowSubtle: '#2A2312',
  yellowShine: '#FFF1C4',
  onAccent: '#0A0E13',
  success: '#78D849',
  successSoft: '#17280F',
  error: '#FF5A5F',
  errorPressed: '#C63F44',
  errorSoft: '#2A1517',
  coral: '#FF7A55',
  sky: '#7CC4F2',
  skySoft: '#13283A',
  banner: '#2152DB',
  bannerSub: '#B9CBFF',
};

export const accents = {
  yellow: { acc: '#F2C14E', dk: '#B38424', soft: '#2A2312', shine: '#FFF1C4', on: '#0A0E13' },
  blue: { acc: '#22D3EE', dk: '#0E9FBF', soft: '#0E2830', shine: '#9BEFFA', on: '#04212A' },
  orange: { acc: '#FF7A55', dk: '#D45B37', soft: '#33190F', shine: '#FFC3AE', on: '#1E0B04' },
} as const;
export type AccentName = keyof typeof accents;

export const fonts = {
  brand: 'Fredoka_700Bold',
  ka: 'NotoSansGeorgian_400Regular',
  kaMedium: 'NotoSansGeorgian_500Medium',
  kaBold: 'NotoSansGeorgian_700Bold',
  en: 'Inter_500Medium',
  enBold: 'Inter_600SemiBold',
};

export const radius = { sm: 10, md: 12, lg: 18, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
