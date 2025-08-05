import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';

const LoadUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token')
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));
          console.log('Utilisateur restauré depuis AsyncStorage ✅');
        }
      } catch (err) {
        console.error('Erreur chargement utilisateur depuis stockage', err);
      }
    };

    loadUserFromStorage();
  }, []);

  return null;
};

export default LoadUser;
