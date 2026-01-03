import { Tabs } from 'expo-router';
import { Lightning, Wrench, ListBullets } from 'phosphor-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0e1a',
          borderBottomWidth: 1,
          borderBottomColor: '#1f2937',
        },
        headerTintColor: '#00ff9d',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 1,
        },
        tabBarStyle: {
          backgroundColor: '#0a0e1a',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#00ff9d',
        tabBarInactiveTintColor: '#4a5568',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ATTACK',
          tabBarIcon: ({ color, size, focused }) => (
            <Lightning size={size + 2} color={color} weight={focused ? 'duotone' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'CONFIG',
          tabBarIcon: ({ color, size, focused }) => (
            <Wrench size={size + 2} color={color} weight={focused ? 'duotone' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, size, focused }) => (
            <ListBullets size={size + 2} color={color} weight={focused ? 'duotone' : 'regular'} />
          ),
        }}
      />
    </Tabs>
  );
}
