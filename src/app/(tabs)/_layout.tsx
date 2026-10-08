import { Tabs } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useAccent } from '../../lib/progress';
import { colors } from '../../theme';

export default function TabsLayout() {
  const a = useAccent();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: a.acc,
      tabBarInactiveTintColor: colors.muted,
      tabBarActiveBackgroundColor: a.soft,
      tabBarStyle: { backgroundColor: '#0F1620', borderTopColor: colors.line, height: 84, paddingTop: 8 },
      tabBarItemStyle: { borderRadius: 12, marginHorizontal: 4 },
      tabBarLabelStyle: { fontFamily: 'NotoSansGeorgian_500Medium', fontSize: 10 },
      sceneStyle: { backgroundColor: colors.bg },
    }}>
      <Tabs.Screen name="index" options={{ title: 'სწავლა', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }} />
      <Tabs.Screen name="practice" options={{ title: 'ვარჯიში', tabBarIcon: ({ color }) => <Icon name="target" color={color} /> }} />
      <Tabs.Screen name="words" options={{ title: 'სიტყვები', tabBarIcon: ({ color }) => <Icon name="book-open" color={color} /> }} />
      <Tabs.Screen name="league" options={{ title: 'ლიგა', tabBarIcon: ({ color }) => <Icon name="award" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'პროფილი', tabBarIcon: ({ color }) => <Icon name="user" color={color} /> }} />
    </Tabs>
  );
}
