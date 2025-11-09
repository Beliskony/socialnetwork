// components/Comments/CommentCard.tsx
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from "react-native"
import { useState, useEffect } from "react" // ✅ Ajout de useEffect
import { useDispatch, useSelector } from "react-redux"
import { Heart, MessageCircle, MoreHorizontal, User, Edit, Trash2, Reply, Send, X } from "lucide-react-native"
import { toggleLikeComment, deleteComment, setCurrentComment, createComment, getCommentReplies, updateComment, getCommentsByPost, getCommentStats } from "@/redux/commentSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import type { Comment } from "@/intefaces/comment.Interfaces"
import { useTheme } from "@/hooks/toggleChangeTheme"
import { formatRelativeDate } from "@/utils/formatRelativeDate"

interface CommentCardProps {
  comment: Comment
  postId: string
  onReply?: (comment: Comment) => void
  onEdit?: (comment: Comment) => void
  showReplies?: boolean
  isReply?: boolean
  onShowReplies?: (commentId: string) => void
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  postId,
  onReply, 
  onEdit,
  showReplies = false,
  isReply = false,
  onShowReplies
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [showEditInput, setShowEditInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [editText, setEditText] = useState(comment.content?.text || "")
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { isDark } = useTheme()
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { replies } = useSelector((state: RootState) => state.comments)

  // ✅ LOG DE DEBUG - Structure du commentaire
  useEffect(() => {
    console.log('🔍 CommentCard - Comment structure:', {
      id: comment._id,
      hasId: !!comment._id,
      idType: typeof comment._id,
      author: comment.author?.username,
      repliesCount: comment.engagement?.repliesCount,
      parentComment: comment.parentComment,
      isReply: isReply
    });
  }, [comment, isReply]);

  // ✅ Vérifications de sécurité
  const getAuthorProfilePicture = () => {
    return comment.author?.profile?.profilePicture || comment.author?.profilePicture || null
  }

  const getAuthorUsername = () => {
    return comment.author?.username || 'Utilisateur inconnu'
  }

  const isOwnComment = currentUser?._id === comment.author?._id
  const isLiked = currentUser?._id && comment.engagement?.likes?.includes(currentUser._id)
  const likesCount = comment.engagement?.likesCount || 0
  const repliesCount = comment.engagement?.repliesCount || 0
  
  const commentReplies = replies.filter(reply => reply.parentComment === comment._id)

  // ✅ LIKE/UNLIKE
  const handleLike = async () => {
    if (!currentUser || isLiking) return
    
    setIsLiking(true)
    try {
      console.log('❤️ Liking comment:', comment._id);
      await dispatch(toggleLikeComment(comment._id)).unwrap()
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de liker le commentaire")
    } finally {
      setIsLiking(false)
    }
  }

  // ✅ SUPPRESSION
  const handleDelete = () => {
    Alert.alert(
      "Supprimer le commentaire",
      "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true)
            try {
              console.log('🗑️ Deleting comment:', comment._id);
              await dispatch(deleteComment(comment._id)).unwrap()

               // ✅ ACTUALISATION SIMPLE : Recharger les commentaires et le feed
            await Promise.all([
              dispatch(getCommentsByPost({ postId: postId, page: 1, limit: 10 })),
            ]);

            await dispatch(getCommentStats(postId)).unwrap()
              console.log("Succès", "Commentaire supprimé")
            } catch (error: any) {
              Alert.alert("Erreur", error || "Impossible de supprimer le commentaire")
            } finally {
              setIsDeleting(false)
              setShowOptions(false)
            }
          },
        },
      ]
    )
  }

  // ✅ RÉPONSE
  const handleReply = () => {
    if (!currentUser) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour répondre")
      return
    }
    setShowReplyInput(true)
    onReply?.(comment)
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !currentUser || isReplying) return
    
    setIsReplying(true)
    try {
      console.log('🆕 Creating reply to comment:', comment._id);
      await dispatch(createComment({
        postId: postId,
        content: { text: replyText.trim() },
        parentComment: comment._id
      })).unwrap()

      // ✅ ACTUALISATION SIMPLE : Recharger les commentaires et le feed
    await Promise.all([
      dispatch(getCommentsByPost({ postId: postId, page: 1, limit: 10 })),

    ]);

      
      setReplyText("")
      setShowReplyInput(false)
      console.log('✅ Reply created successfully');
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de publier la réponse")
    } finally {
      setIsReplying(false)
    }
  }

  const handleCancelReply = () => {
    setReplyText("")
    setShowReplyInput(false)
  }

  // ✅ MODIFICATION
  const handleEdit = () => {
    setEditText(comment.content?.text || "")
    setShowEditInput(true)
    setShowOptions(false)
  }

  const handleSubmitEdit = async () => {
    if (!editText.trim() || !currentUser || isEditing) return
    
    setIsEditing(true)
    try {
      console.log('✏️ Updating comment:', comment._id);
      await dispatch(updateComment({
        commentId: comment._id,
        content: { 
          text: editText.trim(),
          media: comment.content?.media
        }
      })).unwrap()
      
      setShowEditInput(false)
      Alert.alert("Succès", "Commentaire modifié")
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de modifier le commentaire")
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(comment.content?.text || "")
    setShowEditInput(false)
  }

  // ✅ CORRIGÉ : CHARGEMENT DES RÉPONSES AVEC VÉRIFICATION
  const handleLoadReplies = async () => {
    // ✅ VÉRIFICATION CRITIQUE
    if (isLoadingReplies || !comment._id) {
      console.log('❌ Cannot load replies:', {
        isLoading: isLoadingReplies,
        hasCommentId: !!comment._id,
        commentId: comment._id
      });
      return;
    }
    
    setIsLoadingReplies(true);
    try {
      console.log('🔄 Loading replies for comment:', comment._id);
      
      await dispatch(getCommentReplies({ 
        commentId: comment._id, 
        page: 1, 
        limit: 20 
      })).unwrap()
      
      console.log('✅ Replies loaded successfully for comment:', comment._id);
      onShowReplies?.(comment._id);
    } catch (error: any) {
      console.error('❌ Error loading replies:', error);
      Alert.alert("Erreur", "Impossible de charger les réponses");
    } finally {
      setIsLoadingReplies(false);
    }
  }

  // ✅ AVATAR
  const renderAvatar = () => {
    const profilePicture = getAuthorProfilePicture()
    
    if (profilePicture && profilePicture.startsWith('http')) {
      return (
        <Image
          source={{ uri: profilePicture }}
          className="w-8 h-8 rounded-full"
          onError={() => console.log('❌ Image error for:', profilePicture)}
        />
      )
    }
    
    return (
      <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center">
        <User size={16} color="#64748b" />
      </View>
    )
  }

  return (
    <View className={`bg-white dark:bg-black rounded-xl p-4 ${isReply ? 'ml-4 border-l-2 border-slate-200' : 'border border-slate-200 dark:border-gray-500'} mb-3`}>
      
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {renderAvatar()}
          
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-slate-900 dark:text-gray-100 text-sm">
              {getAuthorUsername()}
            </Text>
            <Text className="text-slate-500 text-xs">
              {formatRelativeDate(comment.createdAt)}
              {comment.metadata?.isEdited && " • Modifié"}
            </Text>
          </View>
        </View>

        {/* Options menu - seulement si l'utilisateur est connecté */}
        {currentUser && (
          <TouchableOpacity 
            onPress={() => setShowOptions(!showOptions)}
            disabled={isDeleting}
            className="p-1"
          >
            {isDeleting ? (
              <Text className="text-slate-400 text-xs">Suppression...</Text>
            ) : (
              <MoreHorizontal size={16} color="#64748b" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Options dropdown */}
      {showOptions && (
        <View className="absolute right-4 top-12 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
          {isOwnComment ? (
            <>
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-row items-center px-3 py-2"
              >
                <Edit size={14} color="#64748b" className="mr-2" />
                <Text className="text-slate-700 dark:text-gray-400 text-sm">Modifier</Text>
              </TouchableOpacity>
              <View className="h-px bg-slate-200" />
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-row items-center px-3 py-2"
              >
                <Trash2 size={14} color="#ef4444" className="mr-2" />
                <Text className="text-red-600 text-sm">Supprimer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              className="px-3 py-2"
            >
              <Text className="text-slate-700 text-sm">Signaler</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* CONTENU - Mode édition ou affichage */}
      {showEditInput ? (
        // ✅ MODE ÉDITION
        <View className="mb-3">
          <TextInput
            value={editText}
            onChangeText={setEditText}
            placeholder="Modifier votre commentaire..."
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 rounded-lg px-4 py-3 text-slate-800 text-sm border border-slate-200"
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
          <View className="flex-row justify-end mt-2 space-x-2">
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={isEditing}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <Text className="text-slate-600 text-sm">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitEdit}
              disabled={!editText.trim() || isEditing}
              className="px-4 py-2 bg-blue-600 rounded-lg flex-row items-center"
            >
              <Send size={14} color="white" className="mr-1" />
              <Text className="text-white text-sm font-medium">
                {isEditing ? "..." : "Modifier"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // ✅ MODE AFFICHAGE
        <View className="mb-3">
          <Text className="text-slate-800 dark:text-gray-300 text-sm leading-5">
            {comment.content?.text || 'Contenu non disponible'}
          </Text>

          {/* Media */}
          {comment.content?.media && (
            <View className="mt-2">
              {comment.content.media.images && comment.content.media.images.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {comment.content.media.images.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}
              
              {comment.content.media.videos && comment.content.media.videos.length > 0 && (
                <View className="bg-slate-100 rounded-lg p-3">
                  <Text className="text-slate-600 text-sm">🎥 Vidéo jointe</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ACTIONS */}
      <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
        {/* Like */}
        <TouchableOpacity 
          onPress={handleLike}
          disabled={!currentUser || isLiking}
          className="flex-row items-center"
        >
          <Heart 
            size={16} 
            fill={isLiked ? "#ef4444" : "transparent"}
            color={isLiked ? "#ef4444" : "#64748b"} 
          />
          <Text className={`ml-1 text-xs ${isLiked ? "text-red-500" : "text-slate-600"}`}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        {/* Reply - seulement pour les commentaires principaux */}
        {!isReply && !showEditInput && (
          <TouchableOpacity 
            onPress={handleReply}
            disabled={!currentUser}
            className="flex-row items-center"
          >
            <Reply size={16} color={isDark ? "#fff":"#64748b"} />
            <Text className="ml-1 text-xs text-slate-600 dark:text-gray-400">
              Répondre
            </Text>
          </TouchableOpacity>
        )}

        {/* View replies */}
        {!isReply && repliesCount > 0 && !showEditInput && (
          <TouchableOpacity 
            onPress={handleLoadReplies}
            disabled={isLoadingReplies || !comment._id} // ✅ Désactiver si pas d'ID
            className="flex-row items-center"
          >
            <MessageCircle size={14} color="#3b82f6" />
            <Text className="ml-1 text-xs text-blue-600">
              {isLoadingReplies ? 'Chargement...' : `Voir ${repliesCount} réponse${repliesCount > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* RÉPONSES CHARGÉES */}
      {commentReplies.length > 0 && (
        <View className="mt-3 border-t border-slate-100 pt-3">
          {commentReplies.map(reply => (
            <CommentCard
              key={reply._id}
              comment={reply}
              postId={postId}
              isReply={true}
              onShowReplies={onShowReplies}
            />
          ))}
        </View>
      )}

      {/* INPUT RÉPONSE */}
      {showReplyInput && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <View className="flex-row items-center mb-2">
            <Text className="text-slate-700 text-sm font-medium flex-1">
              Répondre à {getAuthorUsername()}
            </Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Écrire votre réponse..."
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-slate-800 text-sm border border-slate-200"
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSubmitReply}
              disabled={!replyText.trim() || isReplying}
              className="ml-2 bg-blue-600 p-3 rounded-lg"
            >
              <Send size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default CommentCard