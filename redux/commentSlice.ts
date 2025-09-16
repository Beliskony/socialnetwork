import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface UserBrief {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface Comment {
  _id: string;
  user: UserBrief;
  post: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

// ================= Thunks =================

// Récupérer les commentaires d’un post
export const fetchCommentsByPostAsync = createAsyncThunk<
  Comment[],
  { postId: string },
  { rejectValue: string; state: any }
>('comments/fetchByPost', async ({ postId }, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    const response = await axios.get(
      `https://apisocial-g8z6.onrender.com/api/comment/getComment/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data as Comment[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
  }
});

// Ajouter un commentaire
export const addCommentAsync = createAsyncThunk<
  Comment,
  { postId: string; content: string },
  { rejectValue: string; state: any }
>('comments/add', async ({ postId, content }, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    const response = await axios.post(
      `https://apisocial-g8z6.onrender.com/api/comment/create/${postId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data as Comment;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de l’ajout du commentaire');
  }
});

// Modifier un commentaire
export const updateCommentAsync = createAsyncThunk<
  Comment,
  { commentId: string; content: string },
  { rejectValue: string; state: any }
>('comments/update', async ({ commentId, content }, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    const response = await axios.put(
      `https://apisocial-g8z6.onrender.com/api/comment/update/`,
      { commentId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data as Comment;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la modification du commentaire');
  }
});

// Supprimer un commentaire
export const deleteCommentAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: any }
>('comments/delete', async (commentId, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    await axios.delete(`https://apisocial-g8z6.onrender.com/api/comment/delete/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return commentId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression du commentaire');
  }
});

// ================= Slice =================

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
    },
    updateComment: (state, action: PayloadAction<{ _id: string; content: string }>) => {
      const comment = state.comments.find(c => c._id === action.payload._id);
      if (comment) {
        comment.content = action.payload.content;
        comment.updatedAt = new Date().toISOString();
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(c => c._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
  // Fulfilled cases d’abord
  builder
    .addCase(fetchCommentsByPostAsync.fulfilled, (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
      state.loading = false;
      state.error = null;
    })
    .addCase(addCommentAsync.fulfilled, (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
      state.loading = false;
      state.error = null;
    })
    .addCase(updateCommentAsync.fulfilled, (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(c => c._id === action.payload._id);
      if (index !== -1) state.comments[index] = action.payload;
      state.loading = false;
      state.error = null;
    })
    .addCase(deleteCommentAsync.fulfilled, (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(c => c._id !== action.payload);
      state.loading = false;
      state.error = null;
    });

  // Ensuite seulement les matchers
  builder.addMatcher(
    (action) => action.type.endsWith('/pending'),
    (state) => {
      state.loading = true;
      state.error = null;
    }
  );

  builder.addMatcher(
    (action) => action.type.endsWith('/rejected'),
    (state, action: any) => {
      state.loading = false;
      state.error = action.payload || 'Erreur inconnue';
    }
  );
}

});

export const { setComments, addComment, updateComment, deleteComment } = commentSlice.actions;
export default commentSlice.reducer;
