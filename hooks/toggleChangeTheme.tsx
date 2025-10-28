// hooks/toggleChangeTheme.tsx - Version simplifiée
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();
  
  const isDark = colorScheme === 'dark';
  
  const toggleTheme = () => {
    toggleColorScheme();
  };

  const setTheme = (dark: boolean) => {
    setColorScheme(dark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
};