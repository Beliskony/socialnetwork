// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuration des notifications
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

export class NotificationService {
  // 🔥 CORRECTION: Vérifier le projectId dynamiquement
  private static getProjectId(): string {
    // Méthode 1: Depuis les constantes Expo
    if (Constants.expoConfig?.extra?.eas?.projectId) {
      return Constants.expoConfig.extra.eas.projectId;
    }
    
    
    // Méthode 3: Fallback - votre projectId
    return '7dd8c6ad-b479-4968-be4f-aa6383c52165';
  }

  // Demander les permissions AVEC DEBUG
  static async requestPermissions() {
    console.log('🎯 [NotificationService] Début demande permissions...');
    
    if (!Device.isDevice) {
      console.log('❌ [NotificationService] Device physique requis');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log(`📋 [NotificationService] Permission actuelle: ${existingStatus}`);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('📝 [NotificationService] Demande de permission...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log(`📝 [NotificationService] Nouveau statut: ${finalStatus}`);
      }
      
      if (finalStatus !== 'granted') {
        console.error('❌ [NotificationService] Permissions refusées');
        return null;
      }
      
      console.log('✅ [NotificationService] Permissions accordées');
      const token = await this.getExpoPushToken();
      
      if (token) {
        console.log('🚀 [NotificationService] Token obtenu avec succès');
      }
      
      return token;
    } catch (error) {
      console.error('❌ [NotificationService] Erreur permissions:', error);
      return null;
    }
  }

  // Récupérer le token Expo AVEC DEBUG
  static async getExpoPushToken() {
    try {
      console.log('🔧 [NotificationService] Récupération du token...');
      const projectId = this.getProjectId();
      console.log('🔧 [NotificationService] ProjectId utilisé:', projectId);
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      console.log('✅ [NotificationService] Token obtenu:', token.data);
      return token.data;
    } catch (error) {
      console.error('❌ [NotificationService] Erreur token:', error);
      return null;
    }
  }

  // 🔥 AJOUT: Méthode testLocalNotification manquante
  static async testLocalNotification() {
    try {
      console.log('📱 [NotificationService] Envoi notification test...');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Réussi! 🎉",
          body: "Les notifications locales fonctionnent parfaitement",
          sound: 'default',
          data: { type: 'test', screen: 'home' },
        },
        trigger: null, // Immédiatement
      });
      
      console.log('✅ [NotificationService] Notification test envoyée');
      return true;
    } catch (error) {
      console.error('❌ [NotificationService] Erreur test notification:', error);
      return false;
    }
  }

  // 🔥 AJOUT: Méthode getPermissionStatus manquante
  static async getPermissionStatus() {
    try {
      const settings = await Notifications.getPermissionsAsync();
      console.log('🔐 [NotificationService] Statut permissions:', settings);
      return settings;
    } catch (error) {
      console.error('❌ [NotificationService] Erreur statut permissions:', error);
      return { status: 'undetermined' };
    }
  }

  // Configurer les notifications en arrière-plan AVEC DEBUG
  static setupBackgroundNotifications() {
    console.log('🔧 [NotificationService] Configuration background...');
    
    // Configuration Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      }).then(() => console.log('✅ [NotificationService] Canal Android configuré'));
    }

    // Écouteur des notifications reçues
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 [NotificationService] Notification reçue:', notification);
    });

    // Écouteur des interactions
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 [NotificationService] Notification cliquée:', response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  // 🔥 AJOUT: Envoyer le token à votre backend
  static async sendTokenToBackend(token: string, userToken: string) {
    try {
      console.log('🌐 [NotificationService] Envoi token au backend...');
      
      const response = await fetch('https://apisocial-g8z6.onrender.com/api/notifications/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          expoPushToken: token,
          deviceId: Device.modelName || 'unknown',
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('✅ [NotificationService] Token envoyé au backend avec succès');
        return true;
      } else {
        console.error('❌ [NotificationService] Erreur envoi token backend:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ [NotificationService] Erreur envoi token:', error);
      return false;
    }
  }

  // 🔥 AJOUT: Supprimer le token du backend (pour logout)
  static async removeTokenFromBackend(userToken: string) {
    try {
      const response = await fetch('https://apisocial-g8z6.onrender.com/api/notifications/remove-push-token', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        console.log('✅ [NotificationService] Token supprimé du backend');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [NotificationService] Erreur suppression token:', error);
      return false;
    }
  }

  // 🔥 AJOUT: Vérifier si les notifications sont supportées
  static async areNotificationsSupported(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        return false;
      }

      const settings = await Notifications.getPermissionsAsync();
      return settings.status === 'granted';
    } catch (error) {
      console.error('❌ [NotificationService] Erreur vérification support:', error);
      return false;
    }
  }
}