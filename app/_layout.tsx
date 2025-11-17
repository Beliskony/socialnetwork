import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css'
import { Provider } from 'react-redux';
import store from '@/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomThemeProvider } from '@/hooks/toggleChangeTheme';
import { useAuthPersist } from '@/hooks/useAuthPersist';
import { useNotifications } from '@/hooks/useNotifications';
import { StatusBarWrapper } from '@/components/StatusBarWrapper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Créer un composant séparé pour le contenu de l'app qui utilise Redux
function AppContent() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const splashHidden = useRef(false);

  // 🔥 MAINTENANT les hooks Redux peuvent être utilisés car nous sommes dans <Provider>
  useAuthPersist();
  useNotifications();

  useEffect(() => {
    if (loaded && !splashHidden.current) {
      console.log('🎯 Caching splash screen - polices chargées');
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [loaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!splashHidden.current) {
        console.log('⏰ Cache forcé de la splash screen après timeout');
        splashHidden.current = true;
        SplashScreen.hideAsync().catch(console.warn);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <CustomThemeProvider>
      <SafeAreaView style={{ flex: 1 }} className='bg-white dark:bg-black'>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBarWrapper />
      </SafeAreaView>
    </CustomThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        {/* 🔥 MAINTENANT AppContent est dans Provider et peut utiliser Redux */}
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
}