// slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData, 
  PrivacySettings,
  UserState 
} from '../intefaces/user.Interface'
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const API_CONFIG = {
  BASE_URL: 'https://apisocial-g8z6.onrender.com/api/user',
  TIMEOUT: 10000,
};

const initialState: UserState = {
  currentUser: null,
  token: null,
  searchedUsers: [],
  suggestedUsers: [],
  blockedUsers: [],
  loading: false,
  error: null,
  authLoading: false,
};

// Helper pour les appels API
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Helper pour les appels API avec authentification
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, token: string) => {
  return fetchAPI(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// ==================== THUNKS OPTIMISÉS ====================

// 🔐 Connexion
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  console.log('🔄 Tentative de login avec:', credentials.identifiant);
  try {
    const data = await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('🔄 Tentative de login avec:', credentials.identifiant);
  console.log('🌐 URL complète:', `${API_CONFIG.BASE_URL}/login`);
  console.log('⏱️ Timeout configuré:', API_CONFIG.TIMEOUT, 'ms');

    const authData = data.data;

    await AsyncStorage.setItem('auth', JSON.stringify({
      user: authData.user,
      token: authData.token
    }));

    return authData;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la connexion');
  }
});

// 📝 Inscription
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>('user/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const authData = data.data;

    await AsyncStorage.setItem('auth', JSON.stringify({
      user: authData.user,
      token: authData.token
    }));

    return authData;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de l\'inscription');
  }
});

// 👤 Récupérer mon profil
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/getCurrentUser', async (_, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    const data = await fetchWithAuth('/me/profile', { method: 'GET' }, token);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la récupération du profil');
  }
});

// ✏️ Mettre à jour le profil
export const updateUserProfile = createAsyncThunk<
  User,
  UpdateProfileData,
  { rejectValue: string }
>('user/updateProfile', async (userData, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    const data = await fetchWithAuth('/me/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, token);

    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la mise à jour du profil');
  }
});

// 🔍 Rechercher utilisateurs par username
export const searchUsersByUsername = createAsyncThunk<
  User[],
  string,
  { rejectValue: string }
>('user/searchByUsername', async (username, { rejectWithValue }) => {
  try {
    if (!username || username.length < 2) {
      return rejectWithValue('Le nom d\'utilisateur doit contenir au moins 2 caractères');
    }

    const data = await fetchAPI(`/search/${encodeURIComponent(username)}`, {
      method: 'GET',
    });

    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la recherche');
  }
});

// 👤 Récupérer utilisateur par ID
export const getUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('user/getUserById', async (userId, { rejectWithValue }) => {
  try {
    if (!userId) {
      return rejectWithValue('ID utilisateur requis');
    }

    const data = await fetchAPI(`/${userId}`, {
      method: 'GET',
    });

    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la récupération de l\'utilisateur');
  }
});

// 💡 Suggestions d'utilisateurs
export const getSuggestedUsers = createAsyncThunk<
  User[],
  number | void,
  { rejectValue: string }
>('user/getSuggestions', async (limit = 10, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    const data = await fetchWithAuth(`/me/suggestions?limit=${limit}`, {
      method: 'GET',
    }, token);

    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la récupération des suggestions');
  }
});

// ➕ Suivre/Ne plus suivre
export const toggleFollow = createAsyncThunk<
  { action: 'followed' | 'unfollowed'; targetId: string },
  string,
  { rejectValue: string }
>('user/toggleFollow', async (targetId, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    if (!targetId) {
      return rejectWithValue('ID de l\'utilisateur cible requis');
    }

    const data = await fetchWithAuth(`/follow/${targetId}`, {
      method: 'POST',
    }, token);

    return { action: data.action, targetId };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors du follow/unfollow');
  }
});

// 🚫 Bloquer un utilisateur
export const blockUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('user/blockUser', async (targetId, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    if (!targetId) {
      return rejectWithValue('ID de l\'utilisateur cible requis');
    }

    await fetchWithAuth(`/block/${targetId}`, {
      method: 'POST',
    }, token);

    return targetId;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors du blocage');
  }
});

// 🔓 Débloquer un utilisateur
export const unblockUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('user/unblockUser', async (targetId, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    if (!targetId) {
      return rejectWithValue('ID de l\'utilisateur cible requis');
    }

    await fetchWithAuth(`/unblock/${targetId}`, {
      method: 'POST',
    }, token);

    return targetId;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors du déblocage');
  }
});

// 📋 Liste des utilisateurs bloqués
export const getBlockedUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>('user/getBlockedUsers', async (_, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    const data = await fetchWithAuth('/me/blocked-users', {
      method: 'GET',
    }, token);

    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la récupération des utilisateurs bloqués');
  }
});

// ⚙️ Mettre à jour les paramètres de confidentialité
export const updatePrivacySettings = createAsyncThunk<
  User,
  PrivacySettings,
  { rejectValue: string }
>('user/updatePrivacySettings', async (settings, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    const data = await fetchWithAuth('/me/privacy-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, token);

    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la mise à jour des paramètres');
  }
});

// 🛑 Désactiver le compte
export const deactivateAccount = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('user/deactivateAccount', async (reason, { rejectWithValue, getState }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    await fetchWithAuth('/me/deactivate', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, token);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Erreur lors de la désactivation du compte');
  }
});

// 🔄 Charger l'authentification au démarrage
export const loadAuth = createAsyncThunk<
  { user: User; token: string } | null,
  void
>('user/loadAuth', async () => {
  try {
    const savedAuth = await AsyncStorage.getItem('auth');
    if (savedAuth) {
      return JSON.parse(savedAuth);
    }
    return null;
  } catch (error) {
    return null;
  }
});

// ==================== SLICE ====================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
     setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.loading = false;
      state.authLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchedUsers: (state) => {
      state.searchedUsers = [];
    },
    clearSuggestedUsers: (state) => {
      state.suggestedUsers = [];
    },
    clearBlockedUsers: (state) => {
      state.blockedUsers = [];
    },
    updateUserProfileLocal: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    updateUserSocialStats: (state, action: PayloadAction<{ 
      followerCount?: number; 
      followingCount?: number; 
      postCount?: number; 
    }>) => {
      if (state.currentUser) {
        state.currentUser.analytics = {
          ...state.currentUser.analytics,
          ...action.payload
        };
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.searchedUsers = [];
      state.suggestedUsers = [];
      state.blockedUsers = [];
      state.error = null;
      state.loading = false;
      state.authLoading = false;
      AsyncStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Auth
      .addCase(loadAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = action.payload.user;
          state.token = action.payload.token;
        }
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload as string;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Users
      .addCase(searchUsersByUsername.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsersByUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.searchedUsers = action.payload;
      })
      .addCase(searchUsersByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Suggested Users
      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers = action.payload;
      })
      // Toggle Follow
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { action: followAction, targetId } = action.payload;
        if (state.currentUser) {
          if (followAction === 'followed') {
            if (!state.currentUser.social.following.includes(targetId)) {
              state.currentUser.social.following.push(targetId);
              state.currentUser.analytics.followingCount += 1;
            }
          } else {
            state.currentUser.social.following = state.currentUser.social.following.filter(
              id => id !== targetId
            );
            state.currentUser.analytics.followingCount = Math.max(0, state.currentUser.analytics.followingCount - 1);
          }
        }
      })
      // Block User
      .addCase(blockUser.fulfilled, (state, action) => {
        const targetId = action.payload;
        if (state.currentUser && !state.currentUser.social.blockedUsers.includes(targetId)) {
          state.currentUser.social.blockedUsers.push(targetId);
          // Retirer des listes de suivi
          state.currentUser.social.following = state.currentUser.social.following.filter(id => id !== targetId);
          state.currentUser.social.followers = state.currentUser.social.followers.filter(id => id !== targetId);
          // Mettre à jour les compteurs
          state.currentUser.analytics.followingCount = state.currentUser.social.following.length;
          state.currentUser.analytics.followerCount = state.currentUser.social.followers.length;
        }
      })
      // Unblock User
      .addCase(unblockUser.fulfilled, (state, action) => {
        const targetId = action.payload;
        if (state.currentUser) {
          state.currentUser.social.blockedUsers = state.currentUser.social.blockedUsers.filter(
            id => id !== targetId
          );
        }
      })
      // Get Blocked Users
      .addCase(getBlockedUsers.fulfilled, (state, action) => {
        state.blockedUsers = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      // Update Privacy Settings
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      // Deactivate Account
      .addCase(deactivateAccount.fulfilled, (state) => {
        state.currentUser = null;
        state.token = null;
        state.searchedUsers = [];
        state.suggestedUsers = [];
        state.blockedUsers = [];
        AsyncStorage.removeItem('auth');
      });
  },
});

export const {
  setUser, 
  clearError, 
  clearSearchedUsers, 
  clearSuggestedUsers,
  clearBlockedUsers,
  updateUserProfileLocal,
  updateUserSocialStats,
  logout 
} = userSlice.actions;

export default userSlice.reducer;