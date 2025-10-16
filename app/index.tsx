// app/index.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import type { RootState } from '@/redux/store';

export default function StartScreen() {
  const router = useRouter();
  const { token, currentUser } = useAppSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      // Petit délai pour le splash screen
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (token && currentUser) {
        // Utilisateur connecté → aller vers les tabs
        router.replace('/(tabs)/home');
      } else {
        // Utilisateur non connecté → aller vers l'auth
        router.replace('../(auth)');
      }
    };

    checkAuth();
  }, [token, currentUser]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-slate-600 mt-4">Chargement...</Text>
    </View>
  );
}