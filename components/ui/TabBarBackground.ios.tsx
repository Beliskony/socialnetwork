// components/ui/TabBarBackground.tsx
import { useTheme } from '@/hooks/toggleChangeTheme';
import { View } from 'react-native';

export default function TabBarBackground() {
  const { isDark } = useTheme();
  
  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
      }} 
    />
  );
}