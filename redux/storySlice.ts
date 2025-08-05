import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Story {
  _id: string
  user: string        // User ID
  mediaUrl: string    // URL de l'image ou vidéo
  type: 'image' | 'video'
  createdAt: string
  expiresAt: string
}

interface StoryState {
  stories: Story[]
}

const initialState: StoryState = {
  stories: [],
}

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setStories: (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.unshift(action.payload)
    },
    deleteStory: (state, action: PayloadAction<string>) => {
      state.stories = state.stories.filter(s => s._id !== action.payload)
    },
  },
})

export const { setStories, addStory, deleteStory } = storySlice.actions
export default storySlice.reducer