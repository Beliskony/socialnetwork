// app/index.tsx
import { useEffect } from 'react';
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

}