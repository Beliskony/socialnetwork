import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'
import postReducer from './postSlice'
import storyReducer from './storySlice'
import commentReducer from './commentSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    stories: storyReducer,
    comments: commentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;