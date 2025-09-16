import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { IUserPopulated, ICommentPopulated } from '@/intefaces/comment.Interfaces'

export interface Media {
  images?: string[]
  videos?: string[]
}

export interface Post {
  _id: string
  user: IUserPopulated
  text?: string
  media?: Media
  likes?: string[]
  comments?: ICommentPopulated[]
  createdAt: string
  updatedAt: string
}

interface PostState {
  posts: Post[]
  loading: boolean
  error: string | null
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
}

// Axios instance
const api = axios.create({
  baseURL: 'https://apisocial-g8z6.onrender.com/api',
})

// Utilitaire pour récupérer les headers auth
const getAuthHeaders = (getState: any) => {
  const token = (getState() as any).user.token
  if (!token) throw new Error('Token manquant, veuillez vous connecter')
  return { Authorization: `Bearer ${token}` }
}

// Thunks asynchrones
export const addPost = createAsyncThunk<Post, { text?: string; media?: Media }, { rejectValue: string }>(
  'posts/addPost',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      const response = await api.post('/post/create', payload, { headers })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la création du post')
    }
  }
)

export const updatePostAsync = createAsyncThunk<Post, { postId: string; data: Partial<Post> }, { rejectValue: string }>(
  'posts/updatePost',
  async ({ postId, data }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      const response = await api.put(`/post/update/${postId}`, data, { headers })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la modification du post')
    }
  }
)

export const deletePostAsync = createAsyncThunk<string, string, { rejectValue: string }>(
  'posts/deletePost',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      await api.delete(`/post/delete/${postId}`, { headers })
      return postId
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression du post')
    }
  }
)

export const fetchPostsAsync = createAsyncThunk<Post[], void, { rejectValue: string }>(
  'posts/fetchPosts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      const response = await api.get('/post/AllPosts', { headers })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des posts')
    }
  }
)

export const fetchPostsByUserAsync = createAsyncThunk<Post[], void, { rejectValue: string }>(
  'posts/fetchPostsByUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      const response = await api.get('/post/getPostsByUser', { headers })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des posts utilisateur')
    }
  }
)

export const toggleLikePostAsync = createAsyncThunk<
  { postId: string; liked: boolean; userId: string },
  { postId: string },
  { rejectValue: string }
>('posts/toggleLikePost', async ({ postId }, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState)
    const response = await api.put(`/like/toggle/${postId}`, {}, { headers })
    return response.data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du like/dislike du post')
  }
})

// Slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload
    },
    updatePost(state, action: PayloadAction<Post>) {
      const index = state.posts.findIndex((p) => p._id === action.payload._id)
      if (index !== -1) state.posts[index] = action.payload
    },
    deletePost(state, action: PayloadAction<string>) {
      state.posts = state.posts.filter((p) => p._id !== action.payload)
    },
    toggleLike(state, action: PayloadAction<{ postId: string; userId: string }>) {
      const { postId, userId } = action.payload
      const post = state.posts.find((p) => p._id === postId)
      if (!post) return
      if (post.likes?.includes(userId)) {
        post.likes = post.likes.filter((id) => id !== userId)
      } else {
        post.likes?.push(userId)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false
        state.posts.unshift(action.payload)
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur'
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) state.posts[index] = action.payload
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload)
      })
      .addCase(toggleLikePostAsync.fulfilled, (state, action) => {
        const { postId, liked, userId } = action.payload
        if (!userId) return
        postSlice.caseReducers.toggleLike(state, { payload: { postId, userId }, type: '' })
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.posts = action.payload
      })
      .addCase(fetchPostsByUserAsync.fulfilled, (state, action) => {
        state.posts = action.payload
      })
  },
})

export const { setPosts, updatePost, deletePost, toggleLike } = postSlice.actions
export default postSlice.reducer
