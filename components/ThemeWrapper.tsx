import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/toggleChangeTheme';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'dark' : 'light'}`}>
      {children}
    </View>
  );
};