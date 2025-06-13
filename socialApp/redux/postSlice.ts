import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Comment {
  _id: string
  user: string    // User ID
  post: string    // Post ID
  content: string
  createdAt: string
  updatedAt: string
}

interface CommentState {
  comments: Comment[]
}

const initialState: CommentState = {
  comments: [],
}

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload)
    },
    updateComment: (state, action: PayloadAction<{ _id: string; content: string }>) => {
      const comment = state.comments.find(c => c._id === action.payload._id)
      if (comment) {
        comment.content = action.payload.content
        comment.updatedAt = new Date().toISOString()
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(c => c._id !== action.payload)
    },
  },
})

export const { setComments, addComment, updateComment, deleteComment } = commentSlice.actions
export default commentSlice.reducer