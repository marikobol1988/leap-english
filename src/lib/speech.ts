import * as Speech from 'expo-speech';

let kaVoice: string | null | undefined;

/** Speak English (default) or Georgian. Recorded audio should replace this before launch. */
export function speak(text: string, opts: { slow?: boolean; lang?: 'en' | 'ka' } = {}) {
  Speech.stop();
  const lang = opts.lang ?? 'en';
  Speech.speak(text, {
    language: lang === 'ka' ? 'ka-GE' : 'en-US',
    rate: opts.slow ? 0.6 : 0.95,
    voice: lang === 'ka' ? kaVoice ?? undefined : undefined,
  });
}

/** Few phones ship a Georgian voice; only show the Georgian listen button when one exists. */
export async function hasGeorgianVoice() {
  if (kaVoice !== undefined) return !!kaVoice;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    kaVoice = voices.find((v) => v.language?.toLowerCase().startsWith('ka'))?.identifier ?? null;
  } catch { kaVoice = null; }
  return !!kaVoice;
}

export const stopSpeaking = () => Speech.stop();
