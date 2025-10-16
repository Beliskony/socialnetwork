import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/redux/userSlice';

export const useLoadUser = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('🔄 Chargement de l\'utilisateur depuis le stockage...');
        const savedAuth = await AsyncStorage.getItem('auth');
        
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          console.log('✅ Utilisateur chargé:', authData.user?.username);
          
          dispatch(setUser({
            user: authData.user,
            token: authData.token
          }));
        } else {
          console.log('❌ Aucun utilisateur trouvé dans le stockage');
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
      }
    };

    if (!currentUser) {
      loadUserFromStorage();
    }
  }, [dispatch, currentUser]);
};