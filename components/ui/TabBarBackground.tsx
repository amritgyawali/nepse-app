import React from 'react';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabBarBackground() {
  const { theme } = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="dark"
        intensity={100}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background,
      }}
    />
  );
}