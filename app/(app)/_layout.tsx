import { Tabs } from 'expo-router';

export default function AppTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerTitleStyle: { fontWeight: '700' },
      tabBarActiveTintColor: '#2563eb',
      headerShadowVisible: false
    }}>
      <Tabs.Screen name="index" options={{ title: 'Todos', tabBarLabel: 'Todos' }} />
      <Tabs.Screen name="storage" options={{ title: 'Storage', tabBarLabel: 'Storage' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}
