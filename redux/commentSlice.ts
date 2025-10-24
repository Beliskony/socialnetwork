// slices/commentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';
import { Platform } from 'react-native';
import { Comment, CommentState, ICommentFront, IUserPopulated } from '@/intefaces/comment.Interfaces';

const initialState: CommentState = {
  comments: [],
  replies: [],
  popularComments: [],
  currentComment: null,
  loading: false,
  error: null,
  repliesLoading: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Configuration axios
const api = axios.create({
  baseURL: 'https://apisocial-g8z6.onrender.com/api',
});

// Headers d'authentification - CORRIGÉ
const getAuthHeaders = (getState: () => unknown) => {
  const token = (getState() as RootState).user.token;
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Upload Cloudinary pour les médias des commentaires
export const uploadCommentMedia = async (
  uri: string,
  type: 'image' | 'video'
): Promise<string> => {
  try {
    let uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const formData = new FormData();
    formData.append('file', {
      uri: uploadUri,
      type: type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: `comment_media.${type === 'image' ? 'jpg' : 'mp4'}`,
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

// 💬 Créer un commentaire
export const createComment = createAsyncThunk<
  Comment,
  { 
    postId: string; 
    content: { 
      text: string; 
      media?: { images?: string[]; videos?: string[] } 
    };
    parentComment?: string;
    metadata?: { mentions?: string[]; hashtags?: string[] };
  },
  { rejectValue: string; state: RootState }
>('comments/createComment', async (payload, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const isCloudinaryUrl = (url: string) => url.startsWith('https://res.cloudinary.com/');

    // Upload des médias si présents
    const uploadMedia = async (urls: string[] | undefined, type: 'image' | 'video') => {
      if (!urls) return [];
      const uploadPromises = urls
        .filter(url => !isCloudinaryUrl(url))
        .map(url => uploadCommentMedia(url, type));
      return Promise.all(uploadPromises);
    };

    const [uploadedImages, uploadedVideos] = await Promise.all([
      uploadMedia(payload.content.media?.images, 'image'),
      uploadMedia(payload.content.media?.videos, 'video'),
    ]);

    const body = {
      content: {
        text: payload.content.text,
        media: {
          images: [...(payload.content.media?.images?.filter(isCloudinaryUrl) || []), ...uploadedImages],
          videos: [...(payload.content.media?.videos?.filter(isCloudinaryUrl) || []), ...uploadedVideos],
        },
      },
      parentComment: payload.parentComment,
      metadata: payload.metadata,
    };

    const response = await api.post(`/posts/${payload.postId}/comments`, body, { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la création du commentaire');
  }
});

// 📖 Récupérer les commentaires d'un post - CORRIGÉ
export const getCommentsByPost = createAsyncThunk<
  { comments: Comment[]; total: number; pagination?: any },
  { postId: string; page?: number; limit?: number },
  { rejectValue: string; state: RootState }
>('comments/getCommentsByPost', async ({ postId, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
  try {
    console.log('🔄 getCommentsByPost - Début', { postId, page, limit });
    
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`, { headers });
    
    console.log('✅ getCommentsByPost - Succès', response.data);
    return response.data;
  } catch (err: any) {
    console.error('❌ getCommentsByPost - Erreur:', {
      status: err.response?.status,
      message: err.response?.data?.message,
      url: err.config?.url
    });
    
    if (err.response?.status === 404) {
      return rejectWithValue('Post non trouvé');
    }
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
  }
});

// 🔄 Récupérer les réponses d'un commentaire
export const getCommentReplies = createAsyncThunk<
  { replies: Comment[]; total: number },
  { commentId: string; page?: number; limit?: number },
  { rejectValue: string; state: RootState }
>('comments/getCommentReplies', async ({ commentId, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/comments/${commentId}/replies?page=${page}&limit=${limit}`, { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des réponses');
  }
});

// ❤️ Like/Unlike un commentaire - CORRIGÉ
export const toggleLikeComment = createAsyncThunk<
  { commentId: string; likes: string[]; likesCount: number },
  string,
  { rejectValue: string; state: RootState }
>('comments/toggleLike', async (commentId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.post(`/comments/${commentId}/like`, {}, { headers });
    
    console.log('🔍 toggleLike response:', response.data); // Pour debug
    
    // Structure adaptative selon la réponse du backend
    return {
      commentId,
      likes: response.data.likes || response.data.engagement?.likes || [],
      likesCount: response.data.likesCount || response.data.engagement?.likesCount || 0
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du like');
  }
});

// ✏️ Mettre à jour un commentaire
export const updateComment = createAsyncThunk<
  Comment,
  { 
    commentId: string; 
    content: { 
      text: string; 
      media?: { images?: string[]; videos?: string[] } 
    };
    metadata?: { mentions?: string[]; hashtags?: string[] };
  },
  { rejectValue: string; state: RootState }
>('comments/updateComment', async (payload, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    
    // Upload des nouveaux médias si présents
    const isCloudinaryUrl = (url: string) => url.startsWith('https://res.cloudinary.com/');
    const uploadMedia = async (urls: string[] | undefined, type: 'image' | 'video') => {
      if (!urls) return [];
      const uploadPromises = urls
        .filter(url => !isCloudinaryUrl(url))
        .map(url => uploadCommentMedia(url, type));
      return Promise.all(uploadPromises);
    };

    const [uploadedImages, uploadedVideos] = await Promise.all([
      uploadMedia(payload.content.media?.images, 'image'),
      uploadMedia(payload.content.media?.videos, 'video'),
    ]);

    const body = {
      content: {
        text: payload.content.text,
        media: {
          images: [...(payload.content.media?.images?.filter(isCloudinaryUrl) || []), ...uploadedImages],
          videos: [...(payload.content.media?.videos?.filter(isCloudinaryUrl) || []), ...uploadedVideos],
        },
      },
      metadata: payload.metadata,
    };

    const response = await api.put(`/comments/${payload.commentId}`, body, { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la mise à jour du commentaire');
  }
});

// 🗑️ Supprimer un commentaire
export const deleteComment = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('comments/deleteComment', async (commentId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    await api.delete(`/comments/${commentId}`, { headers });
    return commentId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression du commentaire');
  }
});

// 🔥 Commentaires populaires
export const getPopularComments = createAsyncThunk<
  Comment[],
  { postId: string; limit?: number },
  { rejectValue: string; state: RootState }
>('comments/getPopularComments', async ({ postId, limit = 10 }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/posts/${postId}/comments/popular?limit=${limit}`, { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des commentaires populaires');
  }
});

// 📊 Statistiques des commentaires
export const getCommentStats = createAsyncThunk<
  { totalComments: number; totalLikes: number; averageReplies: number },
  string,
  { rejectValue: string; state: RootState }
>('comments/getCommentStats', async (postId, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    const response = await api.get(`/posts/${postId}/comments/stats`, { headers });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
  }
});

// ==================== SLICE ====================

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReplies: (state) => {
      state.replies = [];
    },
    setCurrentComment: (state, action: PayloadAction<ICommentFront | null>) => {
      state.currentComment = action.payload;
    },
    // Mise à jour optimiste pour les likes
    toggleLikeOptimistic: (state, action: PayloadAction<{ commentId: string; userId: string }>) => {
      const { commentId, userId } = action.payload;
      
      const toggleLikeInComment = (comment: Comment) => {
        if (comment._id === commentId) {
          const likeIndex = comment.engagement.likes.indexOf(userId);
          if (likeIndex > -1) {
            // Unlike
            comment.engagement.likes.splice(likeIndex, 1);
            comment.engagement.likesCount = Math.max(0, comment.engagement.likesCount - 1);
          } else {
            // Like
            comment.engagement.likes.push(userId);
            comment.engagement.likesCount += 1;
          }
        }
      };

      state.comments.forEach(toggleLikeInComment);
      state.replies.forEach(toggleLikeInComment);
      state.popularComments.forEach(toggleLikeInComment);
    },
    // Ajouter une réponse localement (optimiste)
    addReplyOptimistic: (state, action: PayloadAction<Comment>) => {
      const newReply = action.payload;
      state.replies.unshift(newReply);
      
      // Mettre à jour le compteur de réponses du commentaire parent
      if (newReply.parentComment) {
        const parentComment = state.comments.find(c => c._id === newReply.parentComment);
        if (parentComment) {
          parentComment.engagement.repliesCount += 1;
        }
      }
    },
    // Réinitialiser les commentaires
    resetComments: (state) => {
      state.comments = [];
      state.replies = [];
      state.popularComments = [];
      state.currentComment = null;
      state.error = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        const newComment = action.payload;
        
        if (newComment.parentComment) {
          // C'est une réponse
          state.replies.unshift(newComment);
          
          // Mettre à jour le compteur du parent
          const parentComment = state.comments.find(c => c._id === newComment.parentComment);
          if (parentComment) {
            parentComment.engagement.replies.push(newComment._id);
            parentComment.engagement.repliesCount += 1;
          }
        } else {
          // C'est un commentaire principal
          state.comments.unshift(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Comments by Post
      .addCase(getCommentsByPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommentsByPost.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments || [];
        
        // Mettre à jour la pagination
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
        
        // Mettre à jour le total si disponible
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
        }
      })
      .addCase(getCommentsByPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.comments = []; // Réinitialiser en cas d'erreur
      })

      // Get Comment Replies
      .addCase(getCommentReplies.pending, (state) => {
        state.repliesLoading = true;
      })
      .addCase(getCommentReplies.fulfilled, (state, action) => {
        state.repliesLoading = false;
        state.replies = action.payload.replies || [];
      })
      .addCase(getCommentReplies.rejected, (state) => {
        state.repliesLoading = false;
      })

      // Toggle Like - CORRIGÉ
      .addCase(toggleLikeComment.fulfilled, (state, action) => {
        const { commentId, likes, likesCount } = action.payload;
        
        const updateCommentInArray = (comments: Comment[]) => {
          const comment = comments.find(c => c._id === commentId);
          if (comment) {
            comment.engagement.likes = likes;
            comment.engagement.likesCount = likesCount;
          }
        };

        updateCommentInArray(state.comments);
        updateCommentInArray(state.replies);
        updateCommentInArray(state.popularComments);
      })

      // Update Comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        
        const updateInArray = (array: Comment[]) => {
          const index = array.findIndex(c => c._id === updatedComment._id);
          if (index !== -1) {
            array[index] = { ...array[index], ...updatedComment };
          }
        };

        updateInArray(state.comments);
        updateInArray(state.replies);
        updateInArray(state.popularComments);
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        
        // Supprimer des tableaux principaux
        state.comments = state.comments.filter(c => c._id !== commentId);
        state.replies = state.replies.filter(c => c._id !== commentId);
        state.popularComments = state.popularComments.filter(c => c._id !== commentId);
        
        // Si c'était le commentaire courant, le vider
        if (state.currentComment?._id === commentId) {
          state.currentComment = null;
        }
      })

      // Get Popular Comments
      .addCase(getPopularComments.fulfilled, (state, action) => {
        state.popularComments = action.payload || [];
      })

      // Get Comment Stats
      .addCase(getCommentStats.fulfilled, (state, action) => {
        // Les stats sont généralement gérées localement dans le composant
        // Mais vous pouvez les stocker dans le state si nécessaire
      });
  },
});

export const { 
  clearError, 
  clearReplies, 
  setCurrentComment, 
  toggleLikeOptimistic,
  addReplyOptimistic,
  resetComments 
} = commentSlice.actions;

export default commentSlice.reducer;

// ==================== SÉLECTEURS ====================

export const selectComments = (state: RootState) => state.comments.comments;
export const selectReplies = (state: RootState) => state.comments.replies;
export const selectPopularComments = (state: RootState) => state.comments.popularComments;
export const selectCurrentComment = (state: RootState) => state.comments.currentComment;

export const selectCommentsLoading = (state: RootState) => state.comments.loading;
export const selectRepliesLoading = (state: RootState) => state.comments.repliesLoading;
export const selectCommentsError = (state: RootState) => state.comments.error;

export const selectCommentById = (commentId: string) => (state: RootState) => 
  state.comments.comments.find(comment => comment._id === commentId) ||
  state.comments.replies.find(comment => comment._id === commentId);

export const selectRepliesByCommentId = (commentId: string) => (state: RootState) =>
  state.comments.replies.filter(reply => reply.parentComment === commentId);

export const selectCommentsPagination = (state: RootState) => state.comments.pagination;