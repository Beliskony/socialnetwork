import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Media {
  images?: string[]
  videos?: string[]
}

export interface Post {
  _id: string
  user: string // user id
  text?: string
  media?: Media
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
  error: null
}

// Thunk asynchrone pour ajouter un post
export const addPost = createAsyncThunk(
  'posts/addPost',
  async (payload: { text: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/posts', payload)
      return response.data // doit être un objet Post complet
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la création du post')
    }
  }
)

// Thunk pour mettre à jour un post
export const updatePostAsync = createAsyncThunk(
  'posts/updatePost',
  async (payload: { id: string; data: Partial<Post> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/posts/${payload.id}`, payload.data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la modification du post')
    }
  }
)

// Thunk pour supprimer un post
export const deletePostAsync = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/posts/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression du post')
    }
  }
)


const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {

    setPosts(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload
    },

    updatePost(state, action: PayloadAction<Post>) {
      const index = state.posts.findIndex(p => p._id === action.payload._id)
      if (index !== -1) state.posts[index] = action.payload
    },

    deletePost(state, action: PayloadAction<string>) {
      state.posts = state.posts.filter(p => p._id !== action.payload)
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
        state.error = action.payload as string
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload._id)
        if (index !== -1) state.posts[index] = action.payload
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload)
      })
  },
})

export const { setPosts, updatePost, deletePost } = postSlice.actions
export default postSlice.reducer