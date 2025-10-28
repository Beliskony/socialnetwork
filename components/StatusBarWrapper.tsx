// components/StatusBarWrapper.tsx
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/toggleChangeTheme';

// Composant pour gérer la StatusBar
export function StatusBarWrapper() {
  const { isDark } = useTheme();
  
  return (
    <StatusBar 
      style={isDark ? "light" : "dark"} 
      backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      translucent={false}
    />
  );
}