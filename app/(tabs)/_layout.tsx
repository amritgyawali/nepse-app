import { Tabs } from 'expo-router';
import React, { ReactNode } from 'react';
import { Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  function HapticTab(props: any): ReactNode {
    return (
      <TouchableOpacity
        {...props}
        onPress={() => {
          props.onPress();
        }}
      />
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="enhanced-dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'chart.line.uptrend.xyaxis' : 'chart.line.uptrend.xyaxis'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="deep-insight"
        options={{
          title: 'AI Insight',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'brain.head.profile' : 'brain.head.profile'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'chart.bar.fill' : 'chart.bar'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'briefcase.fill' : 'briefcase'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'arrow.up.arrow.down' : 'arrow.up.arrow.down'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'gear' : 'gear'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import { StyleSheet } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

const styles = StyleSheet.create({
  tradeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});