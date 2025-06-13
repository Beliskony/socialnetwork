import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
}

const initialState: PostState = {
  posts: [],
}

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload)
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const idx = state.posts.findIndex(p => p._id === action.payload._id)
      if (idx !== -1) {
        state.posts[idx] = action.payload
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p._id !== action.payload)
    },
  },
})

export const { setPosts, addPost, updatePost, deletePost } = postSlice.actions
export default postSlice.reducer