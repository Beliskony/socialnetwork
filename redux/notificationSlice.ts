// store/slices/notificationsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { NotificationService } from '@/services/notificationsService';
import * as Device from 'expo-device'
import { Platform } from 'react-native';
import { 
  INotification, 
  NotificationState, 
  NotificationType,
  GetNotificationsParams, 
  NotificationsResponse
} from '@/intefaces/notification.interfaces';


// Interface pour les erreurs avec gestion silencieuse
interface ErrorWithSilent {
  message: string;
  silent?: boolean;
}

interface RollbackData{
  previousNotifications: INotification[];
  previousUnredCount: number;
}

// État initial aligné avec votre interface
const initialState: NotificationState & {
  rollbackData: RollbackData | null;
  pushToken: string | null;
  permissions: string | null;
} = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: true,
  },
  rollbackData: null,
  pushToken: null,
  permissions: null,
};


// ================= THUNKS AMÉLIORÉS =================

//initialisation de notification expo
export const initializeExpoNotificationsAsync = createAsyncThunk<
{pushToken: string | null; permissions:string},
void,
{rejectValue:string}
>(
  'notification/initializeExpo',
  async(_, {rejectWithValue}) =>{
    try {
      await NotificationService.setupBackgroundNotifications();

      const token = await NotificationService.requestPermissions();
      return{pushToken:token, permissions:token ? 'granted' : 'denied' }

    } catch (error: any) {
       return rejectWithValue(error.message || 'Erreur lors de l\'initialisation des notifications');
    }
  }
);


// 🔔 Enregistrer le token push sur le backend
export const registerPushTokenAsync = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  'notification/registerPushToken',
  async (pushToken, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.user?.token;
      
      if (!token) return rejectWithValue('Token non trouvé');

      await axios.post(
        'https://apisocial-g8z6.onrender.com/api/notifications/register-push-token',
        {
          expoPushToken: pushToken,
          deviceId: Device.modelName || 'mobile-device',
          platform: Platform.OS,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Token push enregistré avec succès');
    } catch (err: any) {
      console.error('❌ Erreur enregistrement token push:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de l\'enregistrement du token push');
    }
  }
);


// 🔄 Récupérer les notifications avec gestion d'erreurs avancée
export const fetchNotificationsAsync = createAsyncThunk<
  NotificationsResponse,
  GetNotificationsParams | void,
  { rejectValue: ErrorWithSilent }
>(
  'notification/fetchAll',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) {
        return rejectWithValue({ 
          message: 'Token non trouvé', 
          silent: false 
        });
      }

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications/',
        { 
          params: {
            page: (params as any)?.page || 1,
            limit: (params as any)?.limit || 20,
            type: (params as any)?.type,
          },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          } 
        }
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      const status = err.response?.status;

      // Gestion des erreurs silencieuses
      if (status === 400 || status === 404) {
        return rejectWithValue({ 
          message: errorMessage, 
          silent: true 
        });
      }

      // Erreurs critiques
      if (status === 401) {
        return rejectWithValue({ 
          message: 'Session expirée - Veuillez vous reconnecter', 
          silent: false 
        });
      }

      return rejectWithValue({ 
        message: errorMessage, 
        silent: false 
      });
    }
  }
);

// 🔄 Récupérer plus de notifications (infinite scroll optimisé)
export const fetchMoreNotificationsAsync = createAsyncThunk<
  NotificationsResponse,
  { page: number; limit?: number },
  { rejectValue: string }
>(
  'notification/fetchMore',
  async ({ page, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications/',
        { 
          params: { page, limit },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          } 
        }
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des notifications');
    }
  }
);

// 🔔 Compter les notifications non lues avec retry automatique
export const fetchUnreadCountAsync = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>(
  'notification/fetchUnreadCount',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications/unread/count',
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }
      );

      return response.data.data.unreadCount;
    } catch (err: any) {
      // Retry automatique pour les erreurs réseau
      if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED') {
        console.log('🔄 Retry automatique du comptage des notifications...');
        setTimeout(() => {
          dispatch(fetchUnreadCountAsync());
        }, 2000);
      }
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du comptage des notifications');
    }
  }
);

// ✅ Marquer une notification comme lue (optimistic update)
export const markNotificationAsReadAsync = createAsyncThunk<
  { notificationId: string; notification: INotification },
  string,
  { rejectValue: string }
>(
  'notification/markAsRead',
  async (notificationId, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      // Optimistic update immédiat
      dispatch(optimisticMarkAsRead(notificationId));

      const response = await axios.patch(
        `https://apisocial-g8z6.onrender.com/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        notificationId,
        notification: response.data.data
      };
    } catch (err: any) {
      // Rollback en cas d'erreur
      dispatch(rollbackMarkAsRead(notificationId));
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
    }
  }
);

// ✅ Marquer toutes les notifications comme lues
export const markAllAsReadAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'notification/markAllAsRead',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      // Optimistic update
      dispatch(optimisticMarkAllAsRead());

      await axios.patch(
        'https://apisocial-g8z6.onrender.com/api/notifications/read/all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (err: any) {
      // Rollback
      dispatch(rollbackMarkAllAsRead());
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du marquage de toutes les notifications');
    }
  }
);

// 🗑️ Supprimer une notification (optimistic delete)
export const deleteNotificationAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'notification/delete',
  async (notificationId, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      // Optimistic delete
      dispatch(optimisticDeleteNotification(notificationId));

      await axios.delete(
        `https://apisocial-g8z6.onrender.com/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return notificationId;
    } catch (err: any) {
      // Rollback
      dispatch(rollbackDeleteNotification(notificationId));
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de la notification');
    }
  }
);

// 🗑️ Supprimer toutes les notifications
export const deleteAllNotificationsAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'notification/deleteAll',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      // Sauvegarder pour rollback
      const state = (getState() as any).notification as NotificationState;
      const previousNotifications = [...state.notifications];
      const previousUnreadCount = state.unreadCount;

      // Optimistic delete
      dispatch(optimisticDeleteAllNotifications());

      await axios.delete(
        'https://apisocial-g8z6.onrender.com/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (err: any) {
      // Rollback avec les données sauvegardées
      dispatch(rollbackDeleteAllNotifications({ 
        previousNotifications: (getState() as any).notification.previousNotifications, 
        previousUnreadCount: (getState() as any).notification.previousUnreadCount 
      }));
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de toutes les notifications');
    }
  }
);

// ================= SLICE AMÉLIORÉ =================

const notificationSlice = createSlice({
  name: 'notification',
  initialState:  {
    ...initialState,
    rollbackData: null as RollbackData | null,
    pushToken: null as string | null,
    permissions: null as string | null,
  },
  reducers: {
    // 🔔 Ajouter une notification (pour WebSocket/real-time)
    addNotification: (state, action: PayloadAction<INotification>) => {
      const existingIndex = state.notifications.findIndex(n => n._id === action.payload._id);
      if (existingIndex === -1) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
        // Mettre à jour le total
        state.pagination.total += 1;
      }
    },

    // 💾 Sauvegarder les données pour rollback
    setRollbackData: (state, action: PayloadAction<RollbackData>) => {
      state.rollbackData = action.payload;
    },

    // ⚡ Optimistic Updates
    optimisticMarkAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    optimisticMarkAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
        }
      });
      state.unreadCount = 0;
    },

    optimisticDeleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },

    optimisticDeleteAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination.total = 0;
      state.pagination.page = 1;
      state.pagination.hasMore = false;
    },

    // 🔄 Rollbacks
    rollbackMarkAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.isRead = false;
        state.unreadCount += 1;
      }
    },

    rollbackMarkAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = false;
      });
      state.unreadCount = state.notifications.length;
    },

    rollbackDeleteNotification: (state, action: PayloadAction<string>) => {
      // La notification sera rechargée au prochain fetch
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },

    rollbackDeleteAllNotifications: (
      state, 
      action: PayloadAction<{ previousNotifications: INotification[]; previousUnreadCount: number }>
    ) => {
      state.notifications = action.payload.previousNotifications;
      state.unreadCount = action.payload.previousUnreadCount;
      state.pagination.total = action.payload.previousNotifications.length;
    },

    // 🧹 Gestion d'état
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = initialState.pagination;
      state.rollbackData = null;
    },

    resetError: (state) => {
      state.error = null;
    },

    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },

    // 🔄 Refresh manuel
    refreshNotifications: (state) => {
      state.pagination.page = 1;
      state.notifications = [];
      state.pagination.hasMore = true;
    },

    // 🔔 Mettre à jour le token push
    setPushToken: (state, action: PayloadAction<string>) => {
      state.pushToken = action.payload;
    },

    // 🔔 Mettre à jour les permissions
    setPermissions: (state, action: PayloadAction<string>) => {
      state.permissions = action.payload;
    },

    // 🎯 Filtrer les notifications localement (optionnel)
    filterNotificationsByType: (state, action: PayloadAction<NotificationType | 'all'>) => {
      // Cette action peut être utilisée pour un filtrage côté client
      // Le filtrage côté serveur se fait via les thunks
    }
  },
  extraReducers: (builder) => {
    builder

       // initializeExpoNotificationsAsync
      .addCase(initializeExpoNotificationsAsync.fulfilled, (state, action) => {
        state.pushToken = action.payload.pushToken;
        state.permissions = action.payload.permissions;
        
        // Enregistrer automatiquement le token sur le backend si disponible
        if (action.payload.pushToken) {
          // Note: Vous pouvez dispatcher registerPushTokenAsync ici si nécessaire
          console.log('✅ Notifications Expo initialisées - Token:', action.payload.pushToken);
        }
      })
      .addCase(initializeExpoNotificationsAsync.rejected, (state, action) => {
        state.error = action.payload || 'Erreur lors de l\'initialisation des notifications';
      })
      
      // registerPushTokenAsync
      .addCase(registerPushTokenAsync.fulfilled, (state) => {
        console.log('✅ Token push enregistré avec succès');
      })
      .addCase(registerPushTokenAsync.rejected, (state, action) => {
        console.error('❌ Erreur enregistrement token:', action.payload);
      })

      // fetchNotificationsAsync
      .addCase(fetchNotificationsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.pagination.unreadCount;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
          hasMore: action.payload.pagination.page < action.payload.pagination.totalPages
        };
        state.loading = false;
      })
      .addCase(fetchNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        // Ne pas afficher les erreurs silencieuses
        if (action.payload && !action.payload.silent) {
          state.error = action.payload.message || 'Erreur inconnue';
        }
      })
      
      // fetchMoreNotificationsAsync
      .addCase(fetchMoreNotificationsAsync.fulfilled, (state, action) => {
        // Fusionner les notifications en évitant les doublons
        const existingIds = new Set(state.notifications.map(n => n._id));
        const newNotifications = action.payload.data.filter(
          (notification: INotification) => !existingIds.has(notification._id)
        );
        
        state.notifications = [...state.notifications, ...newNotifications];
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
          hasMore: action.payload.pagination.page < action.payload.pagination.totalPages
        };
      })
      
      // fetchUnreadCountAsync
      .addCase(fetchUnreadCountAsync.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // markNotificationAsReadAsync (confirmation du serveur)
      .addCase(markNotificationAsReadAsync.fulfilled, (state, action) => {
        const { notificationId, notification } = action.payload;
        const index = state.notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          state.notifications[index] = notification;
        }
        // S'assurer que le compteur est correct
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      
      // markAllAsReadAsync (confirmation du serveur)
      .addCase(markAllAsReadAsync.fulfilled, (state) => {
        // Confirmation que tout est marqué comme lu
        state.unreadCount = 0;
        state.notifications.forEach(n => { n.isRead = true; });
      })
      
      // deleteNotificationAsync (confirmation du serveur)
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        // Suppression déjà faite via optimistic update
        // Juste s'assurer que la notification est bien supprimée
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      
      // deleteAllNotificationsAsync (confirmation du serveur)
      .addCase(deleteAllNotificationsAsync.fulfilled, (state) => {
        // Tout est déjà supprimé via optimistic update
        state.pagination.total = 0;
        state.pagination.hasMore = false;
      });
  },
});

// Export des actions
export const { 
  addNotification,
  optimisticMarkAsRead,
  optimisticMarkAllAsRead,
  optimisticDeleteNotification,
  optimisticDeleteAllNotifications,
  rollbackMarkAsRead,
  rollbackMarkAllAsRead,
  rollbackDeleteNotification,
  rollbackDeleteAllNotifications,
  clearNotifications,
  resetError,
  resetPagination,
  refreshNotifications,
  filterNotificationsByType
} = notificationSlice.actions;

export default notificationSlice.reducer;