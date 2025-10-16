// hooks/useFollow.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFollowAsync, clearFollowError, selectFollowLoading, selectFollowError, selectIsFollowing } from '@/redux/followSlice';
import { AppDispatch, RootState } from '@/redux/store';

export const useFollow = (targetId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const loading = useSelector(selectFollowLoading);
  const error = useSelector(selectFollowError);
  const isFollowing = useSelector(
    targetId ? selectIsFollowing(targetId) : () => false
  );

  const toggleFollow = useCallback((targetUserId: string) => {
    dispatch(toggleFollowAsync(targetUserId));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearFollowError());
  }, [dispatch]);

  return {
    toggleFollow,
    clearError,
    loading,
    error,
    isFollowing: targetId ? isFollowing : false,
  };
};