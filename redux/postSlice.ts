// slices/postSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';
import { Platform } from 'react-native';
import { Post, PostState, initialPostState } from '@/intefaces/post.Interface';

// Configuration axios avec timeout
const api = axios.create({
  baseURL: 'https://apisocial-g8z6.onrender.com/api',
  timeout: 10000,
});

// Headers d'authentification
const getAuthHeaders = (getState: any) => {
  const state = getState() as RootState;
  const token = state.user.token;
  
  if (!token) {
    throw new Error('Token manquant, veuillez vous connecter');
  }
  
  return { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Gestion de l'upload Cloudinary
export const uploadToCloudinary = async (
  uri: string,
  type: 'image' | 'video'
): Promise<string> => {
  try {
    let uploadUri = uri;
    if (Platform.OS === 'ios') {
      uploadUri = uri.replace('file://', '');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: uploadUri,
      type: type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: `upload_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
    } as any);

    formData.append('upload_preset', 'reseau-social');
    formData.append('folder', 'social-posts');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dfpzvlupj/${type}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Échec de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

const isCloudinaryUrl = (url: string): boolean => {
  return url.startsWith('https://res.cloudinary.com/');
};

// ==================== THUNKS CORRIGÉS SELON VOS ROUTES ====================

// 📝 Créer un post - POST /post/create
export const createPost = createAsyncThunk<
  Post,
  { 
    content?: {
      text?: string;
      media?: {
        images?: string[];
        videos?: string[];
      };
    };
    visibility?: {
      privacy: 'public' | 'friends' | 'private';
      allowedUsers?: string[];
    };
    metadata?: {
      tags?: string[];
      mentions?: string[];
      location?: {
        name: string;
        coordinates: { latitude: number; longitude: number };
      };
      hashtags?: string[];
    };
    type?: 'text' | 'image' | 'video' | 'poll' | 'event' | 'share';
    sharedPost?: string;
  },
  { rejectValue: string; state: RootState }
>('post/createPost', async (payload, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    
    // Upload des médias
    const uploadMedia = async (urls: string[] | undefined, type: 'image' | 'video') => {
      if (!urls || urls.length === 0) return [];
      
      const uploaded: string[] = [];
      for (const url of urls) {
        if (isCloudinaryUrl(url)) {
          uploaded.push(url);
        } else {
          try {
            const uploadedUrl = await uploadToCloudinary(url, type);
            uploaded.push(uploadedUrl);
          } catch (error) {
            console.error(`Échec upload ${type}:`, error);
          }
        }
      }
      return uploaded;
    };

    const [uploadedImages, uploadedVideos] = await Promise.all([
      uploadMedia(payload.content?.media?.images, 'image'),
      uploadMedia(payload.content?.media?.videos, 'video')
    ]);

    const body = {
      content: {
        text: payload.content?.text,
        media: {
          images: uploadedImages,
          videos: uploadedVideos,
        },
      },
      visibility: payload.visibility || { privacy: 'public' },
      metadata: payload.metadata,
      type: payload.type || 'text',
      sharedPost: payload.sharedPost
    };

    console.log('📤 Création post:', body);

    const response = await api.post('/post/create', body, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création du post';
    return rejectWithValue(errorMessage);
  }
});

// ✏️ Mettre à jour un post - PUT /post/:postId
export const updatePost = createAsyncThunk<
  Post,
  { 
    postId: string;
    data: { 
      content?: {
        text?: string;
        media?: {
          images?: string[];
          videos?: string[];
        };
      };
      visibility?: {
        privacy?: 'public' | 'friends' | 'private';
        allowedUsers?: string[];
      };
      metadata?: {
        tags?: string[];
        mentions?: string[];
        location?: {
          name: string;
          coordinates: { latitude: number; longitude: number };
        };
        hashtags?: string[];
      };
    }
  },
  { rejectValue: string; state: RootState }
>('post/updatePost', async ({ postId, data }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    console.log('🔄 UPDATE POST - Début');
    console.log('📤 Données reçues:', data);
    console.log('🖼️ Images à traiter:', data.content?.media?.images);
    console.log('🎥 Vidéos à traiter:', data.content?.media?.videos);
    
    const uploadNewMedia = async (urls: string[] | undefined, type: 'image' | 'video') => {
      if (!urls || urls.length === 0) {
        console.log(`📭 Aucun ${type} à uploader`);
        return [];
      };

       console.log(`⬆️ Upload ${type} - URLs:`, urls);
      const uploaded: string[] = [];
      for (const url of urls) {
        if (isCloudinaryUrl(url)) {
          uploaded.push(url);
        } else {
          try {
            const uploadedUrl = await uploadToCloudinary(url, type);
            uploaded.push(uploadedUrl);
          } catch (error) {
            console.error(`Échec upload ${type}:`, error);
          }
        }
      }
      return uploaded;
    };

    const [uploadedImages, uploadedVideos] = await Promise.all([
      uploadNewMedia(data.content?.media?.images, 'image'),
      uploadNewMedia(data.content?.media?.videos, 'video')
    ]);

      console.log('🖼️ Images après upload:', uploadedImages);
    console.log('🎥 Vidéos après upload:', uploadedVideos);

    const body = {
      content: {
        text: data.content?.text,
        media: {
          images: uploadedImages,
          videos: uploadedVideos,
        },
      },
      visibility: data.visibility,
      metadata: data.metadata,
    };

    console.log('📦 Body final envoyé:', body);

    const response = await api.put(`/post/${postId}`, body, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du post';
    return rejectWithValue(errorMessage);
  }
});

// 📖 Fil d'actualité - GET /post/feed
export const getFeed = createAsyncThunk<
  { posts: Post[]; total: number; pagination: any },
  { page?: number; limit?: number; refresh?: boolean },
  { rejectValue: string; state: RootState }
>('post/getFeed', async ({ page = 1, limit = 20, refresh = false }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    
    //console.log('📡 Chargement feed page:', page, 'limit:', limit);
    
    const response = await api.get(`/post/feed?page=${page}&limit=${limit}`, { headers });
    
    //console.log('📦 Réponse feed complète:', response.data);
    //console.log('📊 Données reçues:', response.data.data?.length || 0, 'posts');

       // ✅ DEBUG: Afficher les auteurs des posts reçus
    if (response.data.data && Array.isArray(response.data.data)) {
      //console.log('👥 Auteurs des posts:', response.data.data.map((post: any) => ({
        //auteur: post.author?.username,
        //id: post.author?._id,
        //texte: post.content?.text?.substring(0, 50) + '...'
      //})));
    }

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      posts: response.data.data || [],
      total: response.data.pagination?.total || response.data.data?.length || 0,
      pagination: response.data.pagination || { 
        page, 
        limit, 
        total: response.data.data?.length || 0,
        totalPages: Math.ceil((response.data.pagination?.total || response.data.data?.length || 0) / limit)
      }
    };
  } catch (err: any) {
    console.error('❌ Erreur getFeed:', err.response?.data || err.message);
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du feed';
    return rejectWithValue(errorMessage);
  }
});

// 📊 Tous les posts - GET /post/all (compatibilité)
export const getAllPosts = createAsyncThunk<
  { posts: Post[]; total: number; pagination: any },
  { page?: number; limit?: number },
  { rejectValue: string; state: RootState }
>('post/getAllPosts', async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/post/all?page=${page}&limit=${limit}`, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      posts: response.data.data || [],
      total: response.data.pagination?.total || response.data.data?.length || 0,
      pagination: response.data.pagination || { page, limit, total: response.data.data?.length || 0 }
    };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des posts';
    return rejectWithValue(errorMessage);
  }
});

// 👤 Posts par utilisateur - GET /post/user/:userId
export const getPostsByUser = createAsyncThunk<
  Post[],
  string,
  { rejectValue: string; state: RootState }
>('post/getPostsByUser', async (userId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/post/user/${userId}`, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data || [];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des posts utilisateur';
    return rejectWithValue(errorMessage);
  }
});

// 👤 Mes posts - GET /post/my-posts
export const getMyPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string; state: RootState }
>('post/getMyPosts', async (_, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get('/post/my-posts', { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data || [];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de mes posts';
    return rejectWithValue(errorMessage);
  }
});

// 🔥 Posts populaires - GET /post/popular
export const getPopularPosts = createAsyncThunk<
  Post[],
  number | void,
  { rejectValue: string }
>('post/getPopularPosts', async (limit = 10, { rejectWithValue }) => {
  try {
    const response = await api.get(`/post/popular?limit=${limit}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data || [];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des posts populaires';
    return rejectWithValue(errorMessage);
  }
});

// ❤️ Like/Unlike - POST /post/:postId/like
export const toggleLike = createAsyncThunk<
  { action: 'liked' | 'unliked'; postId: string; likesCount: number },
  string,
  { rejectValue: string; state: RootState }
>('post/toggleLike', async (postId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.post(`/post/${postId}/like`, {}, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return { 
      ...response.data.data, 
      postId,
      likesCount: response.data.data.likesCount || 0 
    };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du like';
    return rejectWithValue(errorMessage);
  }
});

// 💾 Sauvegarder un post - POST /post/:postId/save
export const toggleSave = createAsyncThunk<
  { action: 'saved' | 'unsaved'; postId: string },
  string,
  { rejectValue: string; state: RootState }
>('post/toggleSave', async (postId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.post(`/post/${postId}/save`, {}, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return { ...response.data.data, postId };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
    return rejectWithValue(errorMessage);
  }
});

// 🔄 Partager un post - POST /post/:postId/share
export const sharePost = createAsyncThunk<
  Post,
  { postId: string; text?: string },
  { rejectValue: string; state: RootState }
>('post/sharePost', async ({ postId, text }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.post(`/post/${postId}/share`, { text }, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du partage';
    return rejectWithValue(errorMessage);
  }
});

// 🔍 Recherche de posts - GET /post/search
export const searchPosts = createAsyncThunk<
  { posts: Post[]; total: number; pagination: any },
  { query: string; page?: number; limit?: number },
  { rejectValue: string; state: RootState }
>('post/searchPosts', async ({ query, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/post/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      posts: response.data.data || [],
      total: response.data.pagination?.total || 0,
      pagination: response.data.pagination || { page, limit, total: 0 }
    };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la recherche';
    return rejectWithValue(errorMessage);
  }
});

// 🔍 Recherche simple (compatibilité) - GET /post/searchPost
export const searchPostsSimple = createAsyncThunk<
  Post[],
  string,
  { rejectValue: string }
>('post/searchPostsSimple', async (text, { rejectWithValue }) => {
  try {
    const response = await api.get(`/post/searchPost?text=${encodeURIComponent(text)}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data || [];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la recherche';
    return rejectWithValue(errorMessage);
  }
});

// 🗑️ Supprimer un post - DELETE /post/:postId
export const deletePost = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('post/deletePost', async (postId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.delete(`/post/${postId}`, { headers });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return postId;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression du post';
    return rejectWithValue(errorMessage);
  }
});

// ==================== SLICE COMPLET ====================

const postSlice = createSlice({
  name: 'posts',
  initialState: initialPostState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.feedError = null;
      state.searchError = null;
    },
    clearFeedError: (state) => {
      state.feedError = null;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    clearSearchedPosts: (state) => {
      state.searchedPosts = [];
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    updatePostLocal: (state, action: PayloadAction<Partial<Post> & { _id: string }>) => {
      const updateArray = (array: Post[]) => {
        return array.map(post => 
          post._id === action.payload._id 
            ? { ...post, ...action.payload }
            : post
        );
      };

      state.posts = updateArray(state.posts);
      state.feed = updateArray(state.feed);
      state.userPosts = updateArray(state.userPosts);
      state.popularPosts = updateArray(state.popularPosts);
      
      if (state.currentPost?._id === action.payload._id) {
        state.currentPost = { ...state.currentPost, ...action.payload };
      }
    },
    // Optimistic updates
    optimisticLike: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const { postId, userId } = action.payload;
      
      const optimisticUpdate = (post: Post) => {
        if (post._id === postId && !post.likes?.includes(userId)) {
          return {
            ...post,
            likes: [...(post.likes || []), userId]
          };
        }
        return post;
      };

      state.posts = state.posts.map(optimisticUpdate);
      state.feed = state.feed.map(optimisticUpdate);
      state.userPosts = state.userPosts.map(optimisticUpdate);
      state.popularPosts = state.popularPosts.map(optimisticUpdate);
      
      if (state.currentPost?._id === postId) {
        state.currentPost = optimisticUpdate(state.currentPost);
      }
    },
    optimisticUnlike: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const { postId, userId } = action.payload;
      
      const optimisticUpdate = (post: Post) => {
        if (post._id === postId) {
          return {
            ...post,
            likes: post.likes?.filter(id => id !== userId) || []
          };
        }
        return post;
      };

      state.posts = state.posts.map(optimisticUpdate);
      state.feed = state.feed.map(optimisticUpdate);
      state.userPosts = state.userPosts.map(optimisticUpdate);
      state.popularPosts = state.popularPosts.map(optimisticUpdate);
      
      if (state.currentPost?._id === postId) {
        state.currentPost = optimisticUpdate(state.currentPost);
      }
    },
    appendFeed: (state, action: PayloadAction<Post[]>) => {
      const newPosts = action.payload.filter(
        newPost => !state.feed.some(existingPost => existingPost._id === newPost._id)
      );
      state.feed.push(...newPosts);
    },
    resetPosts: () => initialPostState,
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.feed.unshift(action.payload);
        state.lastFetched.feed = Date.now();
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        
        const updateInArray = (array: Post[]) => {
          const index = array.findIndex(post => post._id === action.payload._id);
          if (index !== -1) {
            array[index] = action.payload;
          }
          return array;
        };

        state.posts = updateInArray([...state.posts]);
        state.feed = updateInArray([...state.feed]);
        state.userPosts = updateInArray([...state.userPosts]);
        state.popularPosts = updateInArray([...state.popularPosts]);
        
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Feed
      .addCase(getFeed.pending, (state, action) => {
        state.feedLoading = true;
        state.feedError = null;
        
        if (action.meta.arg.refresh) {
          state.feed = [];
        }
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.feedLoading = false;
        console.log('✅ Feed chargé:', action.payload.posts.length, 'posts');
        if (action.meta.arg.page === 1 || action.meta.arg.refresh) {
          state.feed = action.payload.posts;
        } else {
          const newPosts = action.payload.posts.filter(
            newPost => !state.feed.some(existingPost => existingPost._id === newPost._id)
          );
          state.feed.push(...newPosts);
        }
        
        state.pagination = action.payload.pagination;
        state.lastFetched.feed = Date.now();
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.feedLoading = false;
        state.feedError = action.payload as string;
      })
      // Get All Posts
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      // Get Posts By User
      .addCase(getPostsByUser.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      })
      // Get My Posts
      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      })
      // Get Popular Posts
      .addCase(getPopularPosts.fulfilled, (state, action) => {
        state.popularPosts = action.payload;
        state.lastFetched.popular = Date.now();
      })
      // Search Posts
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.searchedPosts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      // Search Posts Simple
      .addCase(searchPostsSimple.fulfilled, (state, action) => {
        state.searchedPosts = action.payload;
      })
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, action: likeAction } = action.payload;
        console.log(`Like ${likeAction} for post ${postId}`);
      })
      // Toggle Save
      .addCase(toggleSave.fulfilled, (state, action) => {
        const { postId, action: saveAction } = action.payload;
        console.log(`Save ${saveAction} for post ${postId}`);
      })
      // Share Post
      .addCase(sharePost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.feed.unshift(action.payload);
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        
        state.posts = state.posts.filter((p) => p._id !== postId);
        state.feed = state.feed.filter((p) => p._id !== postId);
        state.userPosts = state.userPosts.filter((p) => p._id !== postId);
        state.popularPosts = state.popularPosts.filter((p) => p._id !== postId);
        state.savedPosts = state.savedPosts.filter((p) => p._id !== postId);
        
        if (state.currentPost?._id === postId) {
          state.currentPost = null;
        }
        
        state.stats.totalPosts = Math.max(0, state.stats.totalPosts - 1);
      });
  },
});

export const { 
  clearError, 
  clearFeedError,
  clearSearchError,
  clearSearchedPosts, 
  setCurrentPost, 
  updatePostLocal,
  optimisticLike,
  optimisticUnlike,
  appendFeed,
  resetPosts 
} = postSlice.actions;

export default postSlice.reducer;