// redux/slices/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { act } from 'react'

export interface UserState {
  _id: string
  username: string
  email: string
  profilePicture?: string
  phoneNumber?: string
  token?: string
  followersCount: number
  postsCount: number
  isLoggedIn: boolean
}

const initialState: UserState = {
  _id: '',
  username: '',
  email: '',
  profilePicture: '',
  phoneNumber: '',
  token: '',
  followersCount: 0,
  postsCount: 0,
  isLoggedIn: false,
}


//Thunk pour mise à jour du profil utilisateur
export const updateUserAsync = createAsyncThunk(
  'user/updateUser',
  async (updateData: Partial<UserState>, {getState, rejectWithValue}) => {
    try {
      const state: any = getState()
      const token = state.user.token

      const response = await axios.put(`https://apisocial-g8z6.onrender.com/api/user/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      return response.data.user
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

//Thunk pour récupérer les informations de l'utilisateur
export const fetchUserMe = createAsyncThunk(
  'user/fetchUserme',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state: any = getState()
      const token = state.user.token
      if (!token) return rejectWithValue('Token manquant')

        const reponse = await axios.get(`https://apisocial-g8z6.onrender.com/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        return reponse.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn'> & { isLoggedIn?: boolean }>) => {
      const { _id, username, email, profilePicture, phoneNumber, token, followersCount, postsCount, isLoggedIn } = action.payload
      state._id = _id
      state.username = username
      state.email = email
      state.profilePicture = profilePicture
      state.phoneNumber = phoneNumber
      state.token = token
      state.followersCount = followersCount
      state.postsCount = postsCount
      state.isLoggedIn = isLoggedIn ?? true

      if (token) {
        AsyncStorage.setItem('token', token)
      }
    },
    logout: (state) => {
      state._id = ''
      state.username = ''
      state.email = ''
      state.profilePicture = undefined
      state.phoneNumber = undefined
      state.token = undefined
      state.followersCount = 0
      state.postsCount = 0
      state.isLoggedIn = false
    },
  },

  extraReducers(builder) {
      builder
      .addCase(updateUserAsync.pending, (state) =>{})
      .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<Partial<UserState>>) => {
        Object.entries(action.payload).forEach(([key, value]) => {
          if (value !== undefined && key in state) {
            (state as any)[key] = value
          }
        })
      })
      .addCase(fetchUserMe.fulfilled, (state, action: PayloadAction<UserState>) => {
        const payload = action.payload
        state._id = payload._id
        state.username = payload.username
        state.email = payload.email
        state.profilePicture = payload.profilePicture
        state.phoneNumber = payload.phoneNumber
        state.token = payload.token
        state.followersCount = payload.followersCount
        state.postsCount = payload.postsCount
        state.isLoggedIn = true
      })
      .addCase(fetchUserMe.rejected, (state, action) => {
        state.isLoggedIn = false
        state.token = undefined
      })
  },
})

export const selectCurrentUser = (state: RootState): UserState |undefined => {
  return state.user.isLoggedIn ? state.user : undefined
}

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer
