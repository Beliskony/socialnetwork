// components/Comments/CommentCard.tsx
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from "react-native"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Heart, MessageCircle, MoreHorizontal, User, Edit, Trash2, Reply } from "lucide-react-native"
import { toggleLikeComment, deleteComment, setCurrentComment, createComment } from "@/redux/commentSlice" // ✅ Ajout de createComment
import type { RootState, AppDispatch } from "@/redux/store"
import type { Comment } from "@/intefaces/comment.Interfaces"
import { formatRelativeDate } from "@/utils/formatRelativeDate"

interface CommentCardProps {
  comment: Comment
  postId: string // ✅ AJOUT IMPORTANT : postId requis pour créer des réponses
  onReply?: (comment: Comment) => void
  onEdit?: (comment: Comment) => void
  showReplies?: boolean
  isReply?: boolean
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  postId, // ✅ Récupération du postId
  onReply, 
  onEdit,
  showReplies = false,
  isReply = false
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReplying, setIsReplying] = useState(false) // ✅ État pour la création de réponse

  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { repliesLoading } = useSelector((state: RootState) => state.comments)

  // Vérifications de sécurité
  const isOwnComment = currentUser?._id === comment.author._id
  const isLiked = currentUser?._id && comment.engagement.likes.includes(currentUser._id)
  const likesCount = comment.engagement.likesCount
  const repliesCount = comment.engagement.repliesCount

  // Gestion des likes
  const handleLike = async () => {
    if (!currentUser || isLiking) return
    
    setIsLiking(true)
    try {
      await dispatch(toggleLikeComment(comment._id)).unwrap()
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de liker le commentaire")
    } finally {
      setIsLiking(false)
    }
  }

  // Gestion de la suppression
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
              await dispatch(deleteComment(comment._id)).unwrap()
              Alert.alert("Succès", "Commentaire supprimé")
            } catch (error: any) {
              Alert.alert("Erreur", error || "Impossible de supprimer le commentaire")
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    )
  }

  // ✅ CORRECTION : Gestion des réponses avec création réelle
  const handleReply = () => {
    if (!currentUser) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour répondre")
      return
    }
    onReply?.(comment)
    setShowReplyInput(true)
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !currentUser || isReplying) return
    
    setIsReplying(true)
    try {
      // ✅ Création de la réponse via Redux
      await dispatch(createComment({
        postId: postId, // ✅ Utilisation du postId
        content: { text: replyText.trim() },
        parentComment: comment._id // ✅ Réponse à ce commentaire
      })).unwrap()
      
      setReplyText("")
      setShowReplyInput(false)
      Alert.alert("Succès", "Réponse publiée !")
      
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de publier la réponse")
    } finally {
      setIsReplying(false)
    }
  }

  return (
    <View className={`bg-white rounded-xl p-4 ${isReply ? 'ml-4 border-l-2 border-slate-200' : 'border border-slate-200'} mb-3`}>
      
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {/* Avatar */}
          {comment.author.profilePicture ? (
            <Image
              source={{ uri: comment.author.profilePicture }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center">
              <User size={16} color="#64748b" />
            </View>
          )}
          
          {/* User info */}
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-slate-900 text-sm">
              {comment.author.username}
            </Text>
            <Text className="text-slate-500 text-xs">
              {formatRelativeDate(comment.createdAt)}
              {comment.metadata.isEdited && " • Modifié"}
            </Text>
          </View>
        </View>

        {/* Options menu */}
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
      </View>

      {/* Options dropdown */}
      {showOptions && (
        <View className="absolute right-4 top-12 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
          {isOwnComment ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false)
                  onEdit?.(comment)
                }}
                className="flex-row items-center px-3 py-2"
              >
                <Edit size={14} color="#64748b" className="mr-2" />
                <Text className="text-slate-700 text-sm">Modifier</Text>
              </TouchableOpacity>
              <View className="h-px bg-slate-200" />
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false)
                  handleDelete()
                }}
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

      {/* Content */}
      <View className="mb-3">
        <Text className="text-slate-800 text-sm leading-5">
          {comment.content.text}
        </Text>

        {/* Media dans les commentaires */}
        {comment.content.media && (
          <View className="mt-2">
            {/* Images */}
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
            
            {/* Videos */}
            {comment.content.media.videos && comment.content.media.videos.length > 0 && (
              <View className="bg-slate-100 rounded-lg p-3">
                <Text className="text-slate-600 text-sm">🎥 Vidéo joint</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
        {/* Like button */}
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

        {/* Reply button - seulement pour les commentaires principaux */}
        {!isReply && (
          <TouchableOpacity 
            onPress={handleReply}
            disabled={!currentUser}
            className="flex-row items-center"
          >
            <Reply size={16} color="#64748b" />
            <Text className="ml-1 text-xs text-slate-600">
              Répondre {repliesCount > 0 && `(${repliesCount})`}
            </Text>
          </TouchableOpacity>
        )}

        {/* View replies button */}
        {showReplies && repliesCount > 0 && (
          <TouchableOpacity 
            onPress={() => dispatch(setCurrentComment(comment as any))}
            className="flex-row items-center"
          >
            <MessageCircle size={14} color="#3b82f6" />
            <Text className="ml-1 text-xs text-blue-600">
              Voir {repliesCount} réponse{repliesCount > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reply input */}
      {showReplyInput && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <View className="flex-row items-center">
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Écrire une réponse..."
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-slate-800 text-sm border border-slate-200"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSubmitReply}
              disabled={!replyText.trim() || isReplying}
              className="ml-2 bg-blue-600 px-3 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-medium">
                {isReplying ? "..." : "Envoyer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default CommentCard