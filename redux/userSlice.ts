// slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData, 
  PrivacySettings,
  UserState, 
  FollowerInfo,
  PasswordResetCompleteData,
  PasswordResetVerifyData,
  PasswordResetInitiateData
} from '../intefaces/user.Interface'
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const API_CONFIG = {
  BASE_URL: 'https://apisocial-g8z6.onrender.com/api/user',
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

  // 🆕 État pour les followers/following
  followersDetails: [],
  followingDetails: [],
  followersLoading: false,
  followingLoading: false,
  followersError: null,
  followingError: null,

  // 🆕 État pour la réinitialisation de mot de passe
 resetLoading: false,
  verifyLoading: false,
  resetError: null,
  verifyError: null,
  codeVerified: false,
  resetStep: 'init',
};

// Helper pour les appels API
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  } catch (error: any) {
  
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Helper pour extraire les IDs des objets MongoDB
const extractUserIds = (ids: any[]): string[] => {
  return ids
    .map(id => {
      // Si c'est un objet MongoDB avec $oid
      if (id && typeof id === 'object' && id.$oid) {
        return id.$oid;
      }
      // Si c'est déjà une string
      if (typeof id === 'string') {
        return id;
      }
      // Si c'est un ObjectId MongoDB
      if (id && id.toString) {
        return id.toString();
      }
      return null;
    })
    .filter((id): id is string => id !== null && id !== undefined);
};


// Gestion de l'upload Cloudinary
// ☁️ Upload vers Cloudinary (version corrigée)
export const uploadToCloudinary = async (
  uri: string,
  type: 'image'
): Promise<string> => {
  try {
    let uploadUri = uri;
    if (Platform.OS === 'ios') {
      uploadUri = uri.replace('file://', '');
    }

    // 🔥 CORRECTION: Déterminer le bon type MIME
    const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    const formData = new FormData();
    formData.append('file', {
      uri: uploadUri,
      type: mimeType, // Utiliser le bon type MIME
      name: `upload_${Date.now()}.${fileExtension}`,
    } as any);

    formData.append('upload_preset', 'reseau-social');
    formData.append('folder', 'social-posts');

    console.log("🔼 Début upload Cloudinary...");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dfpzvlupj/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.secure_url) {
      throw new Error('URL sécurisée non reçue de Cloudinary');
    }

    console.log("✅ Upload Cloudinary réussi:", result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error('❌ Erreur Cloudinary:', error);
    throw new Error(`Échec de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

const isCloudinaryUrl = (url: string): boolean => {
  return url.startsWith('https://res.cloudinary.com/');
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
    console.log("🔍 DEBUG registerUser - Données reçues:", userData);
  
    const data = await fetchAPI(`/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log("🔍 DEBUG registerUser - recu:", data);
    
    const authData = data.data;

    // Stocker l'authentification
    await AsyncStorage.setItem('auth', JSON.stringify({
      user: authData.user,
      token: authData.token
    }));

    return authData;
  } catch (error:any) {
    console.log("❌ DEBUG registerUser - Erreur complète:", error);
    return rejectWithValue(error.message);
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

//modifier son profile
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

    console.log("🔄 Début updateUserProfile avec données:", userData);

    // Créer une copie des données
    const updateData = { ...userData };

    // Upload des images
    if (updateData.profile?.profilePicture && updateData.profile.profilePicture.startsWith('file://')) {
      console.log("📤 Upload photo de profil vers Cloudinary...");
      try {
        const cloudinaryUrl = await uploadToCloudinary(updateData.profile.profilePicture, 'image');
        console.log("✅ Photo de profil uploadée:", cloudinaryUrl);
        updateData.profile.profilePicture = cloudinaryUrl;
      } catch (uploadError) {
        console.error("❌ Erreur upload photo profil:", uploadError);
        return rejectWithValue('Échec de l\'upload de la photo de profil');
      }
    }

    if (updateData.profile?.coverPicture && updateData.profile.coverPicture.startsWith('file://')) {
      console.log("📤 Upload photo de couverture vers Cloudinary...");
      try {
        const cloudinaryUrl = await uploadToCloudinary(updateData.profile.coverPicture, 'image');
        console.log("✅ Photo de couverture uploadée:", cloudinaryUrl);
        updateData.profile.coverPicture = cloudinaryUrl;
      } catch (uploadError) {
        console.error("❌ Erreur upload photo couverture:", uploadError);
        return rejectWithValue('Échec de l\'upload de la photo de couverture');
      }
    }

    console.log("✅ Données finales après traitement:", JSON.stringify(updateData, null, 2));

    // 🔥 AJOUT: Log détaillé de la requête
    console.log("🌐 ENVOI AU BACKEND:");
    console.log("URL:", `${API_CONFIG.BASE_URL}/me/profile`);
    console.log("Method: PUT");
    console.log("Body:", JSON.stringify(updateData));

    const response = await fetch(`${API_CONFIG.BASE_URL}/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    // 🔥 AJOUT: Voir la réponse COMPLÈTE du backend
    console.log("📡 RÉPONSE DU BACKEND:");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    
    const responseText = await response.text();
    console.log("Body:", responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Données retournées par le backend:", data);

    return data.data;

  } catch (error: any) {
    console.error("❌ Erreur complète:", error);
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

//details des followers
export const loadFollowersDetails = createAsyncThunk<
FollowerInfo[],
any[],
{rejectValue: string}
>('user/loadFollowersDetails', async(followerIds, {rejectWithValue, getState}) =>{
  try {
    console.log('🔍 DEBUG - followerIds reçus:', followerIds);

    // 🔥 CORRECTION: Les "followerIds" sont en réalité des objets complets
    const followersDetails = followerIds
      .filter(follower => follower && follower._id) // Filtrer les éléments valides
      .map(follower => ({
        _id: follower._id,
        username: follower.username,
        profile: {
          fullName: follower.profile?.fullName || '',
          profilePicture: follower.profile?.profilePicture || ''
        },
        isFollowing: true // Si c'est un follower, on les suit probablement
      }));

    console.log(`✅ ${followersDetails.length} followers traités sans appel API`);
    return followersDetails;
    
  } catch (error: any) {
    console.error('❌ Erreur loadFollowersDetails:', error);
    return rejectWithValue(error.message || 'Erreur lors du traitement des followers');
  }
})

//details des followings
export const loadFollowingsDetails = createAsyncThunk<
FollowerInfo[],
any[],
{rejectValue: string}
>('user/loadFollowingsDetails', async(followingIds, {rejectWithValue, getState}) =>{
  try {
    console.log('🔍 DEBUG - followingIds reçus:', followingIds);

    // 🔥 CORRECTION: Les "followingIds" sont en réalité des objets complets
    const followingDetails = followingIds
      .filter(following => following && following._id) // Filtrer les éléments valides
      .map(following => ({
        _id: following._id,
        username: following.username,
        profile: {
          fullName: following.profile?.fullName || '',
          profilePicture: following.profile?.profilePicture || ''
        },
        isFollowing: true // Par définition, on suit ces personnes
      }));

    console.log(`✅ ${followingDetails.length} following traités sans appel API`);
    return followingDetails;
    
  } catch (error: any) {
    console.error('❌ Erreur loadFollowingDetails:', error);
    return rejectWithValue(error.message || 'Erreur lors du traitement des following');
  }
})

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
  string, // reason est requis
  { rejectValue: string }
>('user/deactivateAccount', async (reason, { rejectWithValue, getState, dispatch }) => {
  try {
    const { user } = getState() as { user: UserState };
    const token = user.token;

    if (!token) {
      return rejectWithValue('Token non disponible');
    }

    // Validation de la raison
    if (!reason || reason.trim().length === 0) {
      return rejectWithValue('Veuillez fournir une raison pour la désactivation');
    }

    await fetchWithAuth('/me/deactivate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: reason.trim() }),
    }, token);

    // Déconnexion après désactivation réussie
    dispatch(logout());

  } catch (error: any) {
    console.error('Erreur désactivation compte:', error);
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

// ==================== THUNKS RÉINITIALISATION MOT DE PASSE ====================

// 📱 Initier la réinitialisation (envoi du code SMS)
export const initiatePasswordReset = createAsyncThunk<
  void,
  PasswordResetInitiateData,
  { rejectValue: string }
>('user/initiatePasswordReset', async (resetData, { rejectWithValue }) => {
  try {
    console.log('🔄 Début initiatePasswordReset:', resetData);

    const data = await fetchAPI('/password-reset/initiale', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });

    console.log('✅ Code SMS envoyé avec succès');
    return;

  } catch (error: any) {
    console.error('❌ Erreur initiatePasswordReset:', error);
    return rejectWithValue(error.message || 'Erreur lors de l\'envoi du code');
  }
});

// ✅ Vérifier le code de réinitialisation
export const verifyResetCode = createAsyncThunk<
  { valid: boolean },
  PasswordResetVerifyData,
  { rejectValue: string }
>('user/verifyResetCode', async (verifyData, { rejectWithValue }) => {
  try {
    console.log('🔄 Vérification du code:', verifyData.phoneNumber);

    const data = await fetchAPI('/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });

    console.log('✅ Code vérifié:', data.valid);
    return { valid: data.valid };

  } catch (error: any) {
    console.error('❌ Erreur verifyResetCode:', error);
    return rejectWithValue(error.message || 'Erreur lors de la vérification du code');
  }
});

// 🔄 Réinitialiser le mot de passe
export const resetPassword = createAsyncThunk<
  void,
  PasswordResetCompleteData,
  { rejectValue: string }
>('user/resetPassword', async (resetData, { rejectWithValue }) => {
  try {
    console.log('🔄 Réinitialisation du mot de passe:', resetData.phoneNumber);

    const data = await fetchAPI('/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });

    console.log('✅ Mot de passe réinitialisé avec succès');
    return data.data;

  } catch (error: any) {
    console.error('❌ Erreur resetPassword:', error);
    return rejectWithValue(error.message || 'Erreur lors de la réinitialisation');
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

      // 🆕 Réinitialiser les détails des followers
    clearFollowersDetails: (state) => {
      state.followersDetails = [];
      state.followersError = null;
    },
    
    // 🆕 Réinitialiser les détails des following
    clearFollowingDetails: (state) => {
      state.followingDetails = [];
      state.followingError = null;
    },
    
    // 🆕 Mettre à jour un follower après follow/unfollow
    updateFollowerStatus: (state, action: PayloadAction<{ userId: string; isFollowing: boolean }>) => {
      const follower = state.followersDetails.find(f => f._id === action.payload.userId);
      if (follower) {
        follower.isFollowing = action.payload.isFollowing;
      }
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
      })

        // Initiate Password Reset
    .addCase(initiatePasswordReset.pending, (state) => {
      state.resetLoading = true;
      state.resetError = null;
    })
    .addCase(initiatePasswordReset.fulfilled, (state) => {
      state.resetLoading = false;
      state.resetStep = 'verify'; // 🔥 IMPORTANT: Passer à l'étape suivante
      state.resetError = null;
    })
    .addCase(initiatePasswordReset.rejected, (state, action) => {
      state.resetLoading = false;
      state.resetError = action.payload as string;
    })

      // Load Followers Details
      .addCase(loadFollowersDetails.pending, (state) => {
        state.followersLoading = true;
        state.followersError = null;
      })
      .addCase(loadFollowersDetails.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followersDetails = action.payload;
      })
      .addCase(loadFollowersDetails.rejected, (state, action) => {
        state.followersLoading = false;
        state.followersError = action.payload as string;
      })
    
    // 🆕 AJOUTEZ CES EXTRA REDUCERS POUR FOLLOWING
    // Load Following Details
    .addCase(loadFollowingsDetails.pending, (state) => {
      state.followingLoading = true;
      state.followingError = null;
    })
    .addCase(loadFollowingsDetails.fulfilled, (state, action) => {
      state.followingLoading = false;
      state.followingDetails = action.payload;
    })
    .addCase(loadFollowingsDetails.rejected, (state, action) => {
      state.followingLoading = false;
      state.followingError = action.payload as string;
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
  logout,

  // 🆕 AJOUTEZ CES EXPORTS
  clearFollowersDetails,
  clearFollowingDetails,
  updateFollowerStatus
} = userSlice.actions;

export default userSlice.reducer;