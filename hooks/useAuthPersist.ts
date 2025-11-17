// hooks/useAuthPersist.ts
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loadAuth } from '@/redux/userSlice';

export const useAuthPersist = () => {
  const dispatch = useDispatch();
  const isLoaded = useRef(false); // 🔥 POUR ÉVITER LES DOUBLES CHARGEMENTS

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    console.log('🔐 [useAuthPersist] Chargement des données auth...');
    
    // 🔥 NE PAS ATTENDRE - lancer et oublier
    dispatch(loadAuth() as any);
  }, [dispatch]); // 🔥 UNIQUEMENT dispatch en dépendance

  return;
};