// hooks/useComments.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createComment, 
  getCommentsByPost, 
  getCommentReplies,
  toggleLikeComment,
  updateComment,
  deleteComment,
  getPopularComments,
  clearError,
  clearReplies,
  setCurrentComment,
  toggleLikeOptimistic,
  addReplyOptimistic
} from '@/redux/commentSlice';
import { 
  selectComments, 
  selectReplies, 
  selectPopularComments,
  selectCurrentComment,
  selectCommentsLoading,
  selectRepliesLoading,
  selectCommentsError,
  selectCommentById,
  selectRepliesByCommentId 
} from '@/redux/commentSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import type { 
  Comment, 
  ICommentFront 
} from '@/intefaces/comment.Interfaces';

// Types pour les payloads
type CreateCommentPayload = Parameters<typeof createComment>[0];
type GetCommentsByPostPayload = Parameters<typeof getCommentsByPost>[0];
type GetCommentRepliesPayload = Parameters<typeof getCommentReplies>[0];
type UpdateCommentPayload = Parameters<typeof updateComment>[0];
type GetPopularCommentsPayload = Parameters<typeof getPopularComments>[0];

export const useComments = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Sélecteurs de base
  const comments = useSelector(selectComments);
  const replies = useSelector(selectReplies);
  const popularComments = useSelector(selectPopularComments);
  const currentComment = useSelector(selectCurrentComment);
  const loading = useSelector(selectCommentsLoading);
  const repliesLoading = useSelector(selectRepliesLoading);
  const error = useSelector(selectCommentsError);

  // Actions
  const create = useCallback((payload: CreateCommentPayload) => 
    dispatch(createComment(payload)), [dispatch]);

  const fetchByPost = useCallback((payload: GetCommentsByPostPayload) => 
    dispatch(getCommentsByPost(payload)), [dispatch]);

  const fetchReplies = useCallback((payload: GetCommentRepliesPayload) => 
    dispatch(getCommentReplies(payload)), [dispatch]);

  const like = useCallback((commentId: string) => 
    dispatch(toggleLikeComment(commentId)), [dispatch]);

  const update = useCallback((payload: UpdateCommentPayload) => 
    dispatch(updateComment(payload)), [dispatch]);

  const remove = useCallback((commentId: string) => 
    dispatch(deleteComment(commentId)), [dispatch]);

  const fetchPopular = useCallback((payload: GetPopularCommentsPayload) => 
    dispatch(getPopularComments(payload)), [dispatch]);

  const clear = useCallback(() => dispatch(clearError()), [dispatch]);
  const clearAllReplies = useCallback(() => dispatch(clearReplies()), [dispatch]);
  const setCurrent = useCallback((comment: ICommentFront | null) => 
    dispatch(setCurrentComment(comment)), [dispatch]);
  
  const likeOptimistic = useCallback((payload: { commentId: string; userId: string }) => 
    dispatch(toggleLikeOptimistic(payload)), [dispatch]);

  const ReplyOptimistic = useCallback((reply: Comment) => 
    dispatch(addReplyOptimistic(reply)), [dispatch]);

  // ✅ CORRECTION : Sélecteurs avec hook personnalisé séparé
  const useCommentById = (commentId: string): Comment | undefined => 
    useSelector((state: RootState) => selectCommentById(commentId)(state));

  const useRepliesByCommentId = (commentId: string): Comment[] => 
    useSelector((state: RootState) => selectRepliesByCommentId(commentId)(state));

  // Retour typé explicitement
  return {
    // State
    comments,
    replies,
    popularComments,
    currentComment,
    loading,
    repliesLoading,
    error,
    
    // Actions
    createComment: create,
    getCommentsByPost: fetchByPost,
    getCommentReplies: fetchReplies,
    toggleLike: like,
    updateComment: update,
    deleteComment: remove,
    getPopularComments: fetchPopular,
    clearError: clear,
    clearReplies: clearAllReplies,
    setCurrentComment: setCurrent,
    toggleLikeOptimistic: likeOptimistic,
    addReplyOptimistic: ReplyOptimistic,
    
    // ✅ CORRECTION : Retourne les hooks au lieu des fonctions
    useCommentById,
    useRepliesByCommentId,
  };
};

// ✅ Solution alternative si tu préfères garder l'ancienne approche :
export const useCommentById = (commentId: string): Comment | undefined => 
  useSelector((state: RootState) => selectCommentById(commentId)(state));

export const useRepliesByCommentId = (commentId: string): Comment[] => 
  useSelector((state: RootState) => selectRepliesByCommentId(commentId)(state));