// store/slices/notificationsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { INotification } from '@/intefaces/notification.interfaces';

interface NotificationState {
  notifications: INotification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// État initial avec pagination
const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: true,
  },
};

// ================= Thunks Adaptés au Nouveau Backend =================

// Récupérer les notifications avec pagination
export const fetchNotificationsAsync = createAsyncThunk<
  { notifications: INotification[]; pagination: any },
  { page?: number; limit?: number; type?: string } | void,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/fetchAll',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications',
        { 
          params: {
            page: (params as any).page || 1,
            limit: (params as any).limit || 20,
            ...(params && typeof params === 'object' && 'type' in params ? { type: params.type } : {})
          },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      return {
        notifications: response.data.data,
        pagination: response.data.pagination
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des notifications');
    }
  }
);

// Récupérer plus de notifications (infinite scroll)
export const fetchMoreNotificationsAsync = createAsyncThunk<
  { notifications: INotification[]; pagination: any },
  { page: number; limit?: number },
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/fetchMore',
  async ({ page, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications',
        { 
          params: { page, limit },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      return {
        notifications: response.data.data,
        pagination: response.data.pagination
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des notifications');
    }
  }
);

// Compter les notifications non lues
export const fetchUnreadCountAsync = createAsyncThunk<
  number,
  void,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/fetchUnreadCount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/notifications/unread/count',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.data.unreadCount;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du comptage des notifications');
    }
  }
);

// Marquer une notification comme lue
export const markNotificationAsReadAsync = createAsyncThunk<
  { notificationId: string; notification: INotification },
  string,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/markAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

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
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
    }
  }
);

// Marquer toutes les notifications comme lues
export const markAllAsReadAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      await axios.patch(
        'https://apisocial-g8z6.onrender.com/api/notifications/read/all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du marquage de toutes les notifications');
    }
  }
);

// Supprimer une notification
export const deleteNotificationAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/delete',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      await axios.delete(
        `https://apisocial-g8z6.onrender.com/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return notificationId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de la notification');
    }
  }
);

// Supprimer toutes les notifications
export const deleteAllNotificationsAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { user: { token: string } } }
>(
  'notification/deleteAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      await axios.delete(
        'https://apisocial-g8z6.onrender.com/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de toutes les notifications');
    }
  }
);

// ================= Slice =================

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<INotification>) => {
      // Éviter les doublons
      const existingIndex = state.notifications.findIndex(n => n._id === action.payload._id);
      if (existingIndex === -1) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = initialState.pagination;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotificationsAsync
      .addCase(fetchNotificationsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.pagination.unreadCount;
        state.pagination = {
          ...action.payload.pagination,
          hasMore: action.payload.pagination.page < action.payload.pagination.totalPages
        };
        state.loading = false;
      })
      .addCase(fetchNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      })
      
      // fetchMoreNotificationsAsync
      .addCase(fetchMoreNotificationsAsync.fulfilled, (state, action) => {
        state.notifications = [...state.notifications, ...action.payload.notifications];
        state.pagination = {
          ...action.payload.pagination,
          hasMore: action.payload.pagination.page < action.payload.pagination.totalPages
        };
      })
      
      // fetchUnreadCountAsync
      .addCase(fetchUnreadCountAsync.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // markNotificationAsReadAsync
      .addCase(markNotificationAsReadAsync.fulfilled, (state, action) => {
        const { notificationId, notification } = action.payload;
        const index = state.notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          state.notifications[index] = notification;
        }
        // Recalculer le unreadCount pour être sûr
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      
      // markAllAsReadAsync
      .addCase(markAllAsReadAsync.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // deleteNotificationAsync
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
      })
      
      // deleteAllNotificationsAsync
      .addCase(deleteAllNotificationsAsync.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.pagination = initialState.pagination;
      });
  },
});

// Export des actions
export const { 
  addNotification, 
  markAsRead, 
  removeNotification, 
  clearNotifications, 
  resetError,
  resetPagination 
} = notificationSlice.actions;

export default notificationSlice.reducer;