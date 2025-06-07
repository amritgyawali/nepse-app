import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

const lightTheme = {
  colors: Colors.light,
};

const darkTheme = {
  colors: Colors.dark,
};

type ThemeContextType = {
  theme: typeof lightTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(colorScheme === 'dark');
  
  // Update theme when system theme changes
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  const theme = isDark ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}