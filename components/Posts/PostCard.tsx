import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleLike, toggleSave, deletePost } from '@/redux/postSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { PostFront } from '@/intefaces/post.Interface';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreVertical,
  User,
} from 'lucide-react-native';

interface PostCardProps {
  post: PostFront;
  onEdit?: (post: PostFront) => void;
  onPress?: (post: PostFront) => void;
  onUserPress?: (userId: string) => void;
  onCommentPress?: (post: PostFront) => void;
  onDelete?: () => void;
  showActions?: boolean;
  variant?: 'detailed' | 'compact';
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onPress,
  onUserPress,
  onCommentPress,
  onDelete,
  showActions = true,
  variant = 'detailed',
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { loading } = useAppSelector((state: RootState) => state.posts);

  // ✅ CORRECTION : Utiliser la nouvelle structure de l'API
  const postAuthor = post.author || {};
  const postContent = post.content || {};
  const postMedia = postContent.media || {};
  const engagement = post.engagement || {};
  
  const isOwnPost = currentUser?._id === postAuthor._id;
  const isLiked = engagement.likes?.includes(currentUser?._id || '');
  const MAX_TEXT_LENGTH = 150;

  // Si le post est invalide, on ne rend rien
  if (!post || !post._id) {
    return null;
  }

  // Gérer le like/unlike
  const handleLike = async () => {
    if (isLiking || !currentUser) return;
    
    setIsLiking(true);
    try {
      await dispatch(toggleLike(post._id)).unwrap();
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Impossible de liker la publication');
    } finally {
      setIsLiking(false);
    }
  };

  // Gérer la sauvegarde
  const handleSave = async () => {
    if (isSaving || !currentUser) return;
    
    setIsSaving(true);
    try {
      await dispatch(toggleSave(post._id)).unwrap();
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Impossible de sauvegarder la publication');
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer la suppression
  const handleDelete = () => {
    Alert.alert(
      'Supprimer la publication',
      'Êtes-vous sûr de vouloir supprimer cette publication ?',
      [
        { text: 'Annuler', style: 'cancel' as const },
        {
          text: 'Supprimer',
          style: 'destructive' as const,
          onPress: async () => {
            try {
              await dispatch(deletePost(post._id)).unwrap();
              onDelete?.();
            } catch (error: any) {
              Alert.alert('Erreur', error || 'Impossible de supprimer la publication');
            }
          },
        },
      ]
    );
  };

  // Afficher les options (menu déroulant)
  const showOptions = () => {
    const options = [
      { text: 'Annuler', style: 'cancel' as const },
      ...(isOwnPost
        ? [
            {
              text: 'Modifier',
              onPress: () => onEdit?.(post),
            },
            {
              text: 'Supprimer',
              style: 'destructive' as const,
              onPress: handleDelete,
            },
          ]
        : [
            {
              text: 'Signaler',
              style: 'destructive' as const,
              onPress: () => Alert.alert('Signalement', 'Publication signalée'),
            },
          ]),
      {
        text: 'Partager',
        onPress: () => Alert.alert('Partager', 'Fonction de partage'),
      },
    ];

    Alert.alert('Options', 'Que voulez-vous faire ?', options);
  };

  // Rendu du header avec infos utilisateur
  const renderHeader = () => (
    <View className="flex-row items-center justify-between p-4 pb-3">
      <TouchableOpacity 
        className="flex-row items-center flex-1"
        onPress={() => postAuthor._id && onUserPress?.(postAuthor._id)}
      >
        {postAuthor.profilePicture ? (
          <Image
            source={{ uri: postAuthor.profilePicture }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
            <User size={20} color="#64748b" />
          </View>
        )}
        
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900 text-base">
            {postAuthor.username || 'Utilisateur inconnu'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-slate-500 text-sm">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Date inconnue'}
            </Text>
            
            {/* Indicateur de statut de modification */}
            {post.createdAt && post.updatedAt && post.createdAt !== post.updatedAt && (
              <Text className="text-slate-400 text-xs ml-2">
                • modifié
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {showActions && (
        <TouchableOpacity onPress={showOptions} className="p-2">
          <MoreVertical size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Rendu du contenu texte - ✅ CORRECTION : postContent.text au lieu de post.text
  const renderTextContent = () => {
    if (!postContent.text) return null;

    const shouldTruncate = postContent.text.length > MAX_TEXT_LENGTH && !showFullText;
    const displayText = shouldTruncate 
      ? postContent.text.substring(0, MAX_TEXT_LENGTH) + '...' 
      : postContent.text;

    return (
      <View className="px-4 pb-3">
        <Text className="text-slate-900 text-base leading-6">
          {displayText}
        </Text>
        {postContent.text.length > MAX_TEXT_LENGTH && (
          <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
            <Text className="text-blue-600 font-medium mt-2">
              {showFullText ? 'Voir moins' : 'Voir plus'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Rendu des médias - ✅ CORRECTION : postMedia.images et postMedia.videos
  const renderMedia = () => {
    const images = postMedia.images || [];
    const videos = postMedia.videos || [];

    if (images.length === 0 && videos.length === 0) return null;

    return (
      <View className="px-4 pb-3">
        {/* Images */}
        {images.length > 0 && (
          <View className={`${images.length > 1 ? 'flex-row flex-wrap' : ''} gap-2`}>
            {images.slice(0, 4).map((image: any, index: number) => (
              <View 
                key={index} 
                className={`${
                  images.length === 1 ? 'w-full aspect-video' :
                  images.length === 2 ? 'w-[48%] aspect-square' :
                  images.length === 3 ? index === 0 ? 'w-full aspect-video' : 'w-[48%] aspect-square' :
                  'w-[48%] aspect-square'
                } rounded-xl overflow-hidden bg-slate-200`}
              >
                <Image
                  source={{ uri: image.url || image }} // ✅ Supporte les objets {url} ou strings
                  className="w-full h-full"
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <View className="absolute inset-0 items-center justify-center">
                    <ActivityIndicator size="small" color="#3b82f6" />
                  </View>
                )}
                
                {/* Overlay pour les images supplémentaires */}
                {images.length > 4 && index === 3 && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                      +{images.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Vidéos */}
        {videos.length > 0 && (
          <View className="mt-2">
            {videos.slice(0, 1).map((video: any, index: number) => (
              <View key={index} className="w-full aspect-video rounded-xl overflow-hidden bg-slate-200">
                <View className="w-full h-full items-center justify-center">
                  <View className="w-16 h-16 bg-black/50 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">VIDÉO</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Rendu des actions - ✅ CORRECTION : engagement.likes et engagement.comments
  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View className="px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-6">
            {/* Like */}
            <TouchableOpacity 
              onPress={handleLike}
              disabled={isLiking || !currentUser}
              className="flex-row items-center"
            >
              {isLiking ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Heart 
                  size={22} 
                  color={isLiked ? "#ef4444" : "#64748b"} 
                  fill={isLiked ? "#ef4444" : "transparent"} 
                />
              )}
              <Text className={`ml-2 font-medium ${
                isLiked ? 'text-red-500' : 'text-slate-600'
              }`}>
                {engagement.likesCount || engagement.likes?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity 
              onPress={() => onCommentPress?.(post)}
              className="flex-row items-center"
            >
              <MessageCircle size={22} color="#64748b" />
              <Text className="ml-2 text-slate-600 font-medium">
                {engagement.commentsCount || engagement.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity className="flex-row items-center">
              <Share size={22} color="#64748b" />
              <Text className="ml-2 text-slate-600 font-medium">
                {engagement.sharesCount || 0}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save */}
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving || !currentUser}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Bookmark 
                size={22} 
                color="#64748b" 
                fill="transparent" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Rendu version compacte
  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        onPress={() => onPress?.(post)}
        className="bg-white border-b border-slate-200 active:bg-slate-50"
      >
        {renderHeader()}
        {renderTextContent()}
        {renderMedia()}
      </TouchableOpacity>
    );
  }

  // Rendu version détaillée (par défaut)
  return (
    <View className="bg-white border-b border-slate-200">
      {renderHeader()}
      
      <TouchableOpacity onPress={() => onPress?.(post)} activeOpacity={0.9}>
        {renderTextContent()}
        {renderMedia()}
      </TouchableOpacity>

      {renderActions()}
    </View>
  );
};

export default PostCard;