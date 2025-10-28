import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css'
import { Provider } from 'react-redux';
import store from '@/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomThemeProvider } from '@/hooks/toggleChangeTheme';


import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBarWrapper } from '@/components/StatusBarWrapper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <CustomThemeProvider>
        <SafeAreaView style={{ flex: 1 }} className='bg-white dark:bg-black'>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* NOUVEAU - Groupe d'authentification */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBarWrapper />
        </SafeAreaView>
      </CustomThemeProvider>
    </Provider>
  </GestureHandlerRootView>
);


}

