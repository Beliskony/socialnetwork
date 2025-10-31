// slices/storySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';
import { Platform } from 'react-native';
import { Story, StoryState, IStoryPopulated, StoryContent } from '@/intefaces/story.Interface';

const initialState: StoryState = {
  myStories: [],
  followingStories: [],
  currentStory: null,
  loading: false,
  error: null,
  viewsLoading: false,
  uploadLoading: false,
};

// Configuration axios
const api = axios.create({
  baseURL: 'https://apisocial-g8z6.onrender.com/api/story',
});

// Headers d'authentification
const getAuthHeaders = (getState: () => unknown) => {
  const token = (getState() as RootState).user.token;
  if (!token) throw new Error('Token manquant, veuillez vous connecter');
  return { Authorization: `Bearer ${token}` };
};

// Upload Cloudinary pour les stories
export const uploadStoryMedia = async (
  uri: string,
  type: 'image' | 'video'
): Promise<string> => {
  try {
    let uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const formData = new FormData();
    formData.append('file', {
      uri: uploadUri,
      type: type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: `story_media.${type === 'image' ? 'jpg' : 'mp4'}`,
    } as any);
    formData.append('upload_preset', 'reseau-social');

    const response = await fetch(`https://api.cloudinary.com/v1_1/dfpzvlupj/${type}/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.secure_url) {
      throw new Error('Erreur lors de l\'upload sur Cloudinary');
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// ==================== THUNKS ASYNCHRONES ====================

// 📸 Créer une story - VERSION CORRIGÉE
export const createStory = createAsyncThunk<
  IStoryPopulated,
  { content: StoryContent },
  { rejectValue: string; state: RootState }
>('stories/createStory', async (payload, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    let mediaUrl = payload.content.data;

    // Upload du média si ce n'est pas déjà une URL Cloudinary
    if (!mediaUrl.startsWith('https://res.cloudinary.com/')) {
      mediaUrl = await uploadStoryMedia(payload.content.data, payload.content.type);
    }

    // Structure EXACTE comme Postman
    const body = {
      content: {
        type: payload.content.type,
        data: mediaUrl,
      }
    };

    console.log('📤 4. Envoi à l\'API avec body:', JSON.stringify(body, null, 2));
    console.log('🔗 5. URL complète:', `${api.defaults.baseURL}/stories/`);
    
    // ESSAYER DIFFÉRENTS ENDPOINTS
    let response;
    
    try {
      response = await api.post('/', body, { headers });
    } catch (firstError: any) {
      
      try {
        response = await api.post('/stories', body, { headers });
        console.log('✅ Succès avec endpoint sans slash');
      } catch (secondError: any) {
        console.log('❌ Les deux endpoints ont échoué');
        throw firstError; // Relancer la première erreur
      }
    }

    return response.data;
    
  } catch (err: any) {
    console.error('🔴 7. Erreur création story:');
    console.error('🔴 Status:', err.response?.status);
    console.error('🔴 Data:', err.response?.data);
    console.error('🔴 URL:', err.config?.url);
    console.error('🔴 Message:', err.message);
    
    return rejectWithValue(
      err.response?.data?.message || 
      err.response?.data ||
      err.message || 
      'Erreur lors de la création de la story'
    );
  }
});

// 👤 Récupérer mes stories
export const getMyStories = createAsyncThunk<
  IStoryPopulated[],
  void,
  { rejectValue: string; state: RootState }
>('stories/getMyStories', async (_, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get('/my-stories', { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement de vos stories');
  }
});

// 👥 Récupérer les stories des followers
export const getFollowingStories = createAsyncThunk<
  IStoryPopulated[],
  void,
  { rejectValue: string; state: RootState }
>('stories/getFollowingStories', async (_, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get('/following', { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des stories des followers');
  }
});

// 👁️ Marquer une story comme vue
export const viewStory = createAsyncThunk<
  { storyId: string; views: number; userId: string },
  string,
  { rejectValue: string; state: RootState }
>('stories/viewStory', async (storyId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const userId = (getState() as RootState).user.currentUser?._id;
    const response = await api.post(`/${storyId}/view`, {}, { headers });
    return {
      storyId,
      views: response.data.views,
      userId: userId || ''
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la visualisation de la story');
  }
});

// 🗑️ Supprimer une story
export const deleteStory = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('stories/deleteStory', async (storyId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    await api.delete(`/stories/${storyId}`, { headers });
    return storyId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de la story');
  }
});

// 🧹 Nettoyer les stories expirées (Admin)
export const cleanupExpiredStories = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: RootState }
>('stories/cleanupExpired', async (_, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    await api.delete('/stories/cleanup/expired', { headers });
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du nettoyage des stories');
  }
});

// ==================== SLICE ====================

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStory: (state, action: PayloadAction<IStoryPopulated | null>) => {
      state.currentStory = action.payload;
    },
    // Marquer une story comme vue localement (optimiste)
    viewStoryOptimistic: (state, action: PayloadAction<{ storyId: string; userId: string }>) => {
      const { storyId, userId } = action.payload;
      
      const markAsViewed = (story: IStoryPopulated) => {
        if (story._id === storyId && !story.viewedBy.includes(userId)) {
          story.viewedBy.push(userId);
          story.viewsCount = (story.viewsCount || 0) + 1;
          story.hasViewed = true;
        }
      };

      state.myStories.forEach(markAsViewed);
      state.followingStories.forEach(markAsViewed);
      
      if (state.currentStory?._id === storyId) {
        markAsViewed(state.currentStory);
      }
    },
    // Filtrer les stories expirées
    filterExpiredStories: (state) => {
      const now = new Date();
      
      state.myStories = state.myStories.filter(story => 
        new Date(story.expiresAt) > now
      );
      
      state.followingStories = state.followingStories.filter(story => 
        new Date(story.expiresAt) > now
      );
      
      if (state.currentStory && new Date(state.currentStory.expiresAt) <= now) {
        state.currentStory = null;
      }
    },
    // Mettre à jour les données utilisateur dans les stories
    updateStoriesUserData: (state, action: PayloadAction<{ userId: string; userData: any }>) => {
      const { userId, userData } = action.payload;
      
      const updateUserInStories = (stories: IStoryPopulated[]) => {
        stories.forEach(story => {
          if (story.userId._id === userId) {
            story.userId = { ...story.userId, ...userData };
          }
        });
      };
      
      updateUserInStories(state.myStories);
      updateUserInStories(state.followingStories);
      
      if (state.currentStory?.userId._id === userId) {
        state.currentStory.userId = { ...state.currentStory.userId, ...userData };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Story
      .addCase(createStory.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.uploadLoading = false;
        // Ajouter les propriétés calculées
        const newStory = {
          ...action.payload,
          hasViewed: false,
          viewsCount: 0
        };
        state.myStories.unshift(newStory);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      })

      // Get My Stories
      .addCase(getMyStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyStories.fulfilled, (state, action) => {
        state.loading = false;
        // Les données viennent déjà avec les propriétés calculées du backend
        state.myStories = action.payload;
      })
      .addCase(getMyStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Following Stories
      .addCase(getFollowingStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowingStories.fulfilled, (state, action) => {
        state.loading = false;
        // Les données viennent déjà avec les propriétés calculées du backend
        state.followingStories = action.payload;
      })
      .addCase(getFollowingStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // View Story
      .addCase(viewStory.pending, (state) => {
        state.viewsLoading = true;
      })
      .addCase(viewStory.fulfilled, (state, action) => {
        state.viewsLoading = false;
        const { storyId, views, userId } = action.payload;
        
        const updateStoryViews = (story: IStoryPopulated) => {
          if (story._id === storyId) {
            if (userId && !story.viewedBy.includes(userId)) {
              story.viewedBy.push(userId);
            }
            story.viewsCount = views;
            story.hasViewed = true;
          }
        };

        state.myStories.forEach(updateStoryViews);
        state.followingStories.forEach(updateStoryViews);
        
        if (state.currentStory?._id === storyId) {
          updateStoryViews(state.currentStory);
        }
      })
      .addCase(viewStory.rejected, (state) => {
        state.viewsLoading = false;
      })

      // Delete Story
      .addCase(deleteStory.fulfilled, (state, action) => {
        const storyId = action.payload;
        state.myStories = state.myStories.filter(story => story._id !== storyId);
        state.followingStories = state.followingStories.filter(story => story._id !== storyId);
        
        if (state.currentStory?._id === storyId) {
          state.currentStory = null;
        }
      })

      // Cleanup Expired Stories
      .addCase(cleanupExpiredStories.fulfilled, (state) => {
        // Les stories expirées sont automatiquement filtrées côté backend
        console.log('Stories expirées nettoyées avec succès');
      });
  },
});

export const { 
  clearError, 
  setCurrentStory, 
  viewStoryOptimistic,
  filterExpiredStories,
  updateStoriesUserData
} = storySlice.actions;

export default storySlice.reducer;

// ==================== SÉLECTEURS ====================

export const selectMyStories = (state: RootState) => state.stories.myStories;
export const selectFollowingStories = (state: RootState) => state.stories.followingStories;
export const selectCurrentStory = (state: RootState) => state.stories.currentStory;

export const selectStoriesLoading = (state: RootState) => state.stories.loading;
export const selectUploadLoading = (state: RootState) => state.stories.uploadLoading;
export const selectViewsLoading = (state: RootState) => state.stories.viewsLoading;
export const selectStoriesError = (state: RootState) => state.stories.error;

export const selectStoryById = (storyId: string) => (state: RootState) => 
  state.stories.myStories.find(story => story._id === storyId) ||
  state.stories.followingStories.find(story => story._id === storyId);

export const selectUnviewedStoriesCount = (state: RootState) => {
  const currentUserId = state.user.currentUser?._id;
  return state.stories.followingStories.filter(story => 
    !story.viewedBy.includes(currentUserId || '')
  ).length;
};

export const selectActiveStories = (state: RootState) => {
  const now = new Date();
  return {
    myStories: state.stories.myStories.filter(story => new Date(story.expiresAt) > now),
    followingStories: state.stories.followingStories.filter(story => new Date(story.expiresAt) > now)
  };
};

// Sélecteur pour grouper les stories par utilisateur
export const selectStoriesGroupedByUser = (state: RootState) => {
  const activeStories = selectActiveStories(state);
  
  const groupedStories: { [userId: string]: IStoryPopulated[] } = {};
  
  activeStories.followingStories.forEach(story => {
    const userId = story.userId._id;
    if (!groupedStories[userId]) {
      groupedStories[userId] = [];
    }
    groupedStories[userId].push(story);
  });
  
  return groupedStories;
};