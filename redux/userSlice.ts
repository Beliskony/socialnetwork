// redux/slices/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ================== Types ==================
export interface UserState {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  token?: string;
  followersCount: number;
  postsCount: number;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  _id: '',
  username: '',
  email: '',
  profilePicture: '',
  phoneNumber: '',
  token: undefined, // ⚡ undefined par défaut
  followersCount: 0,
  postsCount: 0,
  isLoggedIn: false,
  loading: false,
  error: null,
};

// ================== Thunks ==================

// --- Login ---
export const loginAsync = createAsyncThunk<
  { user: UserState; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('https://apisocial-g8z6.onrender.com/api/user/login', credentials);
    const { user, token } = response.data;

    // Sauvegarde du token
    await AsyncStorage.setItem('token', token);

    return { user, token };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de la connexion');
  }
});

// --- Register ---
export const registerAsync = createAsyncThunk<
  { user: UserState; token: string },
  { username: string; email: string; password: string },
  { rejectValue: string }
>('user/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post('https://apisocial-g8z6.onrender.com/api/user/register', payload);
    const { user, token } = response.data;

    await AsyncStorage.setItem('token', token);

    return { user, token };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors de l’inscription');
  }
});

// --- Fetch user connecté ---
export const fetchUserMe = createAsyncThunk<
  UserState,
  void,
  { rejectValue: string; state: RootState }
>('user/fetchUserMe', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('Token manquant');

    const response = await axios.get('https://apisocial-g8z6.onrender.com/api/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { ...response.data, token } as UserState; // ⚡ on garde le token existant
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement de l’utilisateur');
  }
});

// --- Load token au démarrage ---
export const loadToken = createAsyncThunk(
  'user/loadToken',
  async (_, { dispatch }) => {
    const saved = await AsyncStorage.getItem('auth');
    if (saved) {
      const { user, token } = JSON.parse(saved);
      // On met d'abord le token dans Redux
      dispatch(setUser({ ...user, token, isLoggedIn: true }));
      // Puis on va chercher les infos user
      await (dispatch as AppDispatch)(fetchUserMe());
    }
  }
);

// ================== Slice ==================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<Partial<UserState> & { isLoggedIn?: boolean }>
    ) => {
      Object.assign(state, action.payload);
      state.isLoggedIn = action.payload.isLoggedIn ?? true;
    },
    logout: (state) => {
      state._id = '';
      state.username = '';
      state.email = '';
      state.profilePicture = undefined;
      state.phoneNumber = undefined;
      state.token = undefined;
      state.followersCount = 0;
      state.postsCount = 0;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
      AsyncStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        Object.assign(state, user);
        state.token = token;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        Object.assign(state, user);
        state.token = token;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // FetchUserMe
    builder
      .addCase(fetchUserMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMe.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(fetchUserMe.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.token = undefined;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ================== Selectors ==================

export const selectCurrentUser = (state: RootState): UserState | undefined =>
  state.user.isLoggedIn ? state.user : undefined;

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
