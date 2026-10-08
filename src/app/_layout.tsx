import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { NotoSansGeorgian_400Regular, NotoSansGeorgian_500Medium, NotoSansGeorgian_700Bold } from '@expo-google-fonts/noto-sans-georgian';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth';
import { useProgress } from '../lib/progress';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();
  const ready = useProgress((s) => s.ready);
  const load = useProgress((s) => s.load);
  const clear = useProgress((s) => s.clear);

  useEffect(() => {
    if (session) load().catch((e) => console.warn('progress load failed', e));
    else clear();
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const booting = loading || (!!session && !ready);
  useEffect(() => { if (!booting) SplashScreen.hideAsync(); }, [booting]);
  if (booting) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[nodeId]" />
        <Stack.Screen name="session" options={{ gestureEnabled: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="guide/[unitId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="out-of-hearts" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold, Inter_500Medium, Inter_600SemiBold,
    NotoSansGeorgian_400Regular, NotoSansGeorgian_500Medium, NotoSansGeorgian_700Bold,
  });
  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
