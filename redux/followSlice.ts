// redux/slices/followSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store';

// ================== Types ==================
export interface FollowState {
  loading: boolean;
  error: string | null;
  success: boolean;
  followingIds: string[];
}

export interface ToggleFollowResponse {
  action: "followed" | "unfollowed";
  targetId: string;
}

const initialState: FollowState = {
  loading: false,
  error: null,
  success: false,
  followingIds: [],
};

// ================== Thunks ==================

// --- Toggle Follow/Unfollow ---
export const toggleFollowAsync = createAsyncThunk<
  ToggleFollowResponse,
  string, // targetId
  { rejectValue: string; state: RootState }
>('follow/toggle', async (targetId, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    
    if (!token) {
      return rejectWithValue('Token manquant');
    }

    const response = await axios.post(
      `https://apisocial-g8z6.onrender.com/api/user/follow/${targetId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      action: response.data.action,
      targetId
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du follow/unfollow');
  }
});

// --- Fetch les utilisateurs suivis ---
export const fetchFollowingAsync = createAsyncThunk<
  string[],
  void,
  { rejectValue: string; state: RootState }
>('follow/fetchFollowing', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    const userId = getState().user.currentUser?._id;
    
    if (!token) {
      return rejectWithValue('Token manquant');
    }

    // Cette route devrait retourner les IDs des utilisateurs suivis
    const response = await axios.get(
      `https://apisocial-g8z6.onrender.com/api/user/${userId}/following`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.followingIds || [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des follows');
  }
});

// ================== Slice ==================

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    clearFollowError: (state) => {
      state.error = null;
    },
    resetFollowState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setFollowingIds: (state, action: PayloadAction<string[]>) => {
      state.followingIds = action.payload;
    },
    // Action pour mettre à jour localement sans appel API
    updateFollowingState: (state, action: PayloadAction<{targetId: string; isFollowing: boolean}>) => {
      const { targetId, isFollowing } = action.payload;
      
      if (isFollowing && !state.followingIds.includes(targetId)) {
        state.followingIds.push(targetId);
      } else {
        state.followingIds = state.followingIds.filter(id => id !== targetId);
      }
    },
  },
  extraReducers: (builder) => {
    // Toggle Follow
    builder
      .addCase(toggleFollowAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleFollowAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        const { action: followAction, targetId } = action.payload;
        
        if (followAction === 'followed') {
          if (!state.followingIds.includes(targetId)) {
            state.followingIds.push(targetId);
          }
        } else {
          state.followingIds = state.followingIds.filter(id => id !== targetId);
        }
      })
      .addCase(toggleFollowAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Fetch Following
    builder
      .addCase(fetchFollowingAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.followingIds = action.payload;
      })
      .addCase(fetchFollowingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ================== Selectors ==================
export const selectFollowLoading = (state: RootState) => state.follows.loading;
export const selectFollowError = (state: RootState) => state.follows.error;
export const selectFollowSuccess = (state: RootState) => state.follows.success;
export const selectFollowingIds = (state: RootState) => state.follows.followingIds;
export const selectIsFollowing = (targetId: string) => (state: RootState) => 
  state.follows.followingIds.includes(targetId);

export const { 
  clearFollowError, 
  resetFollowState, 
  setFollowingIds,
  updateFollowingState 
} = followSlice.actions;
export default followSlice.reducer;