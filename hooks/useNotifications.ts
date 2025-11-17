// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/services/notificationsService';
import { initializeExpoNotificationsAsync, registerPushTokenAsync } from '@/redux/notificationSlice';
import { RootState } from '@/redux/store';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // 🔥 NE PAS ÉCOUTER pushToken DANS useSelector - ÇA CAUSE LA BOUCLE
  const { token: userToken } = useSelector((state: RootState) => state.user);

  // 🔥 RÉFÉRENCES POUR ÉVITER LES BOUCLES
  const isInitialized = useRef(false);
  const currentUserToken = useRef<string | null>(null);

  // 🔥 GESTIONNAIRE DE CLIC - DÉPLACÉ EN DEHORS DU useEffect
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    
    console.log('👆 Notification cliquée:', data);

    if (data?.type === 'follow' && data?.senderId) {
      router.push({
        pathname: '/(modals)/userProfile/[userId]' as any,
        params: { userId: String(data.senderId) }
      });
    }
    else if (data?.postId) {
      router.push({
        pathname: '/(modals)/singlePost/[postId]' as any,
        params: { postId: String(data.postId) }
      });
    }
    else {
      router.push('/(tabs)/notifications' as any);
    }
  };

  useEffect(() => {
    console.log('🚀 [useNotifications] Setup - userToken:', userToken ? 'présent' : 'absent');

    // 🔥 CONFIGURATION DE BASE (UNE SEULE FOIS)
    if (!isInitialized.current) {
      console.log('🔧 Configuration initiale des notifications...');
      
      // Configuration des listeners
      const cleanup = NotificationService.setupBackgroundNotifications();

      // Écouteur pour les clics
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

      // Configuration du handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      isInitialized.current = true;

      // 🔥 NETTOYAGE
      return () => {
        console.log('🧹 Nettoyage configuration notifications');
        cleanup();
        responseSubscription.remove();
      };
    }
  }, []); // 🔥 EXÉCUTION UNE SEULE FOIS

  // 🔥 EFFET SÉPARÉ POUR L'INITIALISATION EXPO (déclenché par userToken)
  useEffect(() => {
    // 🔥 ÉVITER LES APPELS EN DOUBLE
    if (userToken === currentUserToken.current) {
      return;
    }

    currentUserToken.current = userToken;

    if (userToken) {
      console.log('🔑 User connecté, initialisation Expo...');
      
      const initializeExpo = async () => {
        try {
          const result = await dispatch(initializeExpoNotificationsAsync() as any);
          
          if (initializeExpoNotificationsAsync.fulfilled.match(result)) {
            const { pushToken: expoToken } = result.payload;
            
            console.log('✅ Expo initialisé, token:', !!expoToken);

            if (expoToken) {
              console.log('🌐 Envoi token au backend...');
              await dispatch(registerPushTokenAsync(expoToken) as any);
            }
          }
        } catch (error) {
          console.error('❌ Erreur initialisation Expo:', error);
        }
      };

      // 🔥 DÉLAI POUR ÉVITER LA CONCURRENCE
      const timer = setTimeout(() => {
        initializeExpo();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('🔒 User déconnecté - skip initialisation Expo');
    }
  }, [userToken, dispatch]); // 🔥 SEULEMENT userToken comme déclencheur

  return;
};