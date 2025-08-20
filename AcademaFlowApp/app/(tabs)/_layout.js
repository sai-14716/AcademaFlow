import React from 'react';
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../_layout'; // Import theme from root layout

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Timetable',
          tabBarIcon: ({ color }) => <Icon name="calendar-week" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
