// redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  _id: string
  username: string
  email: string
  profilePicture?: string
  phoneNumber?: string
  followersCount: number
  postsCount: number
  isLoggedIn: boolean
}

const initialState: UserState = {
  _id: '',
  username: '',
  email: '',
  profilePicture: undefined,
  phoneNumber: undefined,
  followersCount: 0,
  postsCount: 0,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn'> & { isLoggedIn?: boolean }>) => {
      const { _id, username, email, profilePicture, phoneNumber, followersCount, postsCount, isLoggedIn } = action.payload
      state._id = _id
      state.username = username
      state.email = email
      state.profilePicture = profilePicture
      state.phoneNumber = phoneNumber
      state.followersCount = followersCount
      state.postsCount = postsCount
      state.isLoggedIn = isLoggedIn ?? true
    },
    logout: (state) => {
      state._id = ''
      state.username = ''
      state.email = ''
      state.profilePicture = undefined
      state.phoneNumber = undefined
      state.followersCount = 0
      state.postsCount = 0
      state.isLoggedIn = false
    },
  },
})

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer
