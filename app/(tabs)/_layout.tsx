import { Tabs } from 'expo-router';
import { Leaf, Cloud, Lightbulb, User, Camera, TrendingUp } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Leaf size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather',
          tabBarIcon: ({ size, color }) => (
            <Cloud size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: 'Diagnosis',
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="advisory"
        options={{
          title: 'Advisory',
          tabBarIcon: ({ size, color }) => (
            <Lightbulb size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});