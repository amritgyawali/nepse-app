import React from 'react';
import { View } from 'react-native';
import { Home, LineChart, Brain, ShoppingBag, Settings, BarChart, Briefcase, ArrowUpDown } from 'lucide-react-native';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  const getIcon = () => {
    switch (name) {
      case 'house':
      case 'house.fill':
        return <Home size={size} color={color} />;
      case 'chart.line.uptrend.xyaxis':
        return <LineChart size={size} color={color} />;
      case 'brain.head.profile':
        return <Brain size={size} color={color} />;
      case 'chart.bar':
      case 'chart.bar.fill':
        return <BarChart size={size} color={color} />;
      case 'briefcase':
      case 'briefcase.fill':
        return <Briefcase size={size} color={color} />;
      case 'arrow.up.arrow.down':
        return <ArrowUpDown size={size} color={color} />;
      case 'bag':
      case 'bag.fill':
        return <ShoppingBag size={size} color={color} />;
      case 'gear':
      case 'gear.fill':
        return <Settings size={size} color={color} />;
      default:
        return <View />;
    }
  };

  return getIcon();
}