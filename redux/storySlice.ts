import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Story {
  _id: string;
  user: string;       // User ID
  mediaUrl: string;   // URL de l'image ou vidéo
  type: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
}

interface StoryState {
  stories: Story[];
  loading: boolean;
  error: string | null;
}

const initialState: StoryState = {
  stories: [],
  loading: false,
  error: null,
};

// ================= Thunks =================

// Récupérer toutes les stories
export const fetchStoriesAsync = createAsyncThunk<
  Story[],
  void,
  { rejectValue: string; state: any }
>('stories/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    const response = await axios.get('https://apisocial-g8z6.onrender.com/api/story/getUser', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data as Story[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des stories');
  }
});

// Ajouter une story
export const addStoryAsync = createAsyncThunk<
  Story,
  { mediaUrl: string; type: 'image' | 'video' },
  { rejectValue: string; state: any }
>('stories/add', async ({ mediaUrl, type }, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    const response = await axios.post(
      'https://apisocial-g8z6.onrender.com/api/story/create',
      { data: mediaUrl, type },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data as Story;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de l’ajout de la story');
  }
});

// Supprimer une story
export const deleteStoryAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: any }
>('stories/delete', async (storyId, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token non trouvé');

    await axios.delete(`https://apisocial-g8z6.onrender.com/api/story/delete/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return storyId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression de la story');
  }
});

// ================= Slice =================

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setStories: (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload;
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.unshift(action.payload);
    },
    deleteStory: (state, action: PayloadAction<string>) => {
      state.stories = state.stories.filter(s => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
  // Cas spécifiques d’abord
  builder
    .addCase(fetchStoriesAsync.fulfilled, (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload;
      state.loading = false;
      state.error = null;
    })
    .addCase(addStoryAsync.fulfilled, (state, action: PayloadAction<Story>) => {
      state.stories.unshift(action.payload);
      state.loading = false;
      state.error = null;
    })
    .addCase(deleteStoryAsync.fulfilled, (state, action: PayloadAction<string>) => {
      state.stories = state.stories.filter(s => s._id !== action.payload);
      state.loading = false;
      state.error = null;
    })

    // Ensuite seulement les matchers
    .addMatcher(
      (action) => action.type.endsWith('/pending'),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    )
    .addMatcher(
      (action) => action.type.endsWith('/rejected'),
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      }
    );
}

});

export const { setStories, addStory, deleteStory } = storySlice.actions;
export default storySlice.reducer;
