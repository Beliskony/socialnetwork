// hooks/useStories.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createStory, 
  getMyStories, 
  getFollowingStories,
  viewStory,
  deleteStory,
  cleanupExpiredStories,
  clearError,
  setCurrentStory,
  viewStoryOptimistic,
  filterExpiredStories
} from '@/redux/storySlice';
import { 
  selectMyStories, 
  selectFollowingStories,
  selectCurrentStory,
  selectStoriesLoading,
  selectUploadLoading,
  selectViewsLoading,
  selectStoriesError,
  selectStoryById,
  selectUnviewedStoriesCount,
  selectActiveStories,
  selectStoriesGroupedByUser
} from '@/redux/storySlice';
import type { AppDispatch, RootState } from '@/redux/store';
import type { StoryContent, IStoryPopulated } from '@/intefaces/story.Interface';

export const useStories = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Sélecteurs
  const myStories = useSelector(selectMyStories);
  const followingStories = useSelector(selectFollowingStories);
  const currentStory = useSelector(selectCurrentStory);
  const loading = useSelector(selectStoriesLoading);
  const uploadLoading = useSelector(selectUploadLoading);
  const viewsLoading = useSelector(selectViewsLoading);
  const error = useSelector(selectStoriesError);

  // Actions
  const create = useCallback((payload: { content: StoryContent }) => 
    dispatch(createStory(payload)), [dispatch]);

  const fetchMyStories = useCallback(() => 
    dispatch(getMyStories()), [dispatch]);

  const fetchFollowingStories = useCallback(() => 
    dispatch(getFollowingStories()), [dispatch]);

  const markAsViewed = useCallback((storyId: string) => 
    dispatch(viewStory(storyId)), [dispatch]);

  const remove = useCallback((storyId: string) => 
    dispatch(deleteStory(storyId)), [dispatch]);

  const cleanup = useCallback(() => 
    dispatch(cleanupExpiredStories()), [dispatch]);

  const clear = useCallback(() => dispatch(clearError()), [dispatch]);
  const setCurrent = useCallback((story: IStoryPopulated | null) => 
    dispatch(setCurrentStory(story)), [dispatch]);
  
  const viewOptimistic = useCallback((payload: { storyId: string; userId: string }) => 
    dispatch(viewStoryOptimistic(payload)), [dispatch]);

  const filterExpired = useCallback(() => 
    dispatch(filterExpiredStories()), [dispatch]);

  // Sélecteurs avec mémoïsation
  const getStory = useCallback((storyId: string) => 
    useSelector((state: RootState) => selectStoryById(storyId)(state)), []);

  const getUnviewedCount = useCallback(() => 
    useSelector(selectUnviewedStoriesCount), []);

  const getActiveStories = useCallback(() => 
    useSelector(selectActiveStories), []);

  const getGroupedStories = useCallback(() => 
    useSelector(selectStoriesGroupedByUser), []);

  return {
    // State
    myStories,
    followingStories,
    currentStory,
    loading,
    uploadLoading,
    viewsLoading,
    error,
    
    // Actions
    createStory: create,
    getMyStories: fetchMyStories,
    getFollowingStories: fetchFollowingStories,
    viewStory: markAsViewed,
    deleteStory: remove,
    cleanupExpiredStories: cleanup,
    clearError: clear,
    setCurrentStory: setCurrent,
    viewStoryOptimistic: viewOptimistic,
    filterExpiredStories: filterExpired,
    
    // Sélecteurs
    getStory,
    getUnviewedCount,
    getActiveStories,
    getGroupedStories,
  };
};