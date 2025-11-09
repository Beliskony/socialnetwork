import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleLike, toggleSave, deletePost, getFeed } from '@/redux/postSlice';
import * as Sharing from 'expo-sharing';
import { createComment, getCommentsByPost } from '@/redux/commentSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { PostFront } from '@/intefaces/post.Interface';
import VideoPlayerItem from './VideoPlayerItem';
import { useTheme } from '@/hooks/toggleChangeTheme';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreVertical,
  User,
  Send,
  X,
} from 'lucide-react-native';
import CommentCard from '@/components/Comments/CommentCard';
import MediaFullScreen from './modalOpen/MediaFullScreen';
import CreatePost from './CreatePost';
import CommentCardSkeleton from '../skeletons/SkeletonCommentCard';


interface PostCardProps {
  post: PostFront;
  onEdit?: (post: PostFront) => void;
  onPress?: (post: PostFront) => void;
  onUserPress?: (userId: string) => void;
  onCommentPress?: (post: PostFront) => void;
  onDelete?: () => void;
  showActions?: boolean;
  variant?: 'detailed' | 'compact';
  showComments?: boolean;
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
  showComments = false,
}) => {

  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { isDark } = useTheme();
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  
  // ✅ ÉTATS POUR GÉRER LE LIKE AVEC SYNCHRO DB
  const [isLiking, setIsLiking] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);

  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<PostFront | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);

  const openFullScreen= (index: number) => {
      console.log('🖼️ openFullScreen appelé avec index:', index);
  setInitialMediaIndex(index);
  setFullScreenVisible(true);
  console.log('🖼️ fullScreenVisible devrait être true');
  };

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { loading } = useAppSelector((state: RootState) => state.posts);
  const { comments, loading: commentsLoading } = useAppSelector((state: RootState) => state.comments);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ STRUCTURE DE L'API
  const postContent = post.content || {};
  const postMedia = postContent.media || {};
  const engagement = post.engagement || {};
  
  const isOwnPost = currentUser?._id === post.author._id;
  const MAX_TEXT_LENGTH = 150;

  // ✅ INITIALISATION BASÉE SUR LA DB
  useEffect(() => {
    // Vérifier l'état réel dans la base de données
    const dbIsLiked = engagement.likes?.includes(currentUser?._id || '');
    const dbLikesCount = engagement.likesCount || engagement.likes?.length || 0;
    
    setLocalIsLiked(dbIsLiked);
    setLocalLikesCount(dbLikesCount);
  }, [post._id, engagement, currentUser]);

  // Si le post est invalide, on ne rend rien
  if (!post || !post._id) {
    return null;
  }

  // ✅ FONCTION LIKE AVEC SYNCHRONISATION DB
  const handleLike = async () => {
    if (!currentUser || isLiking) return;
    
    // ✅ Sauvegarder l'état précédent pour rollback
    const previousIsLiked = localIsLiked;
    const previousLikesCount = localLikesCount;
    
    // ✅ Mise à jour optimiste IMMÉDIATE
    setLocalIsLiked(!previousIsLiked);
    setLocalLikesCount(previousIsLiked ? previousLikesCount - 1 : previousLikesCount + 1);
    setIsLiking(true);
    
    try {
      console.log(`🔄 Tentative de ${previousIsLiked ? 'unlike' : 'like'} pour le post ${post._id}`);
      
      // ✅ Appel API pour synchroniser avec la DB
      const result = await dispatch(toggleLike(post._id)).unwrap();
      
      console.log(`✅ ${previousIsLiked ? 'Unlike' : 'Like'} réussi:`, result);
      
      // ✅ FORCER LE RECHARGEMENT DU FEED POUR SYNCHRONISATION
      //await dispatch(getFeed({ page: 1, limit: 20, refresh: true })).unwrap();
      
    } catch (error: any) {
      console.error('❌ Erreur like:', error);
      
      // ✅ ROLLBACK IMMÉDIAT en cas d'erreur
      setLocalIsLiked(previousIsLiked);
      setLocalLikesCount(previousLikesCount);
      
      Alert.alert(
        'Erreur', 
        error?.message || 'Impossible de liker la publication. Vérification de l\'état actuel...'
      );
      
      // ✅ FORCER LA RESYNCHRONISATION AVEC LA DB
      try {
        await dispatch(getFeed({ page: 1, limit: 20, refresh: true })).unwrap();
      } catch (refreshError) {
        console.error('❌ Erreur resynchronisation:', refreshError);
      }
    } finally {
      setIsLiking(false);
    }
  };

  // ✅ FONCTION SAUVEGARDE AVEC SYNCHRO DB
  //const handleSave = async () => {
    //if (!currentUser || isSaving) return;
    
    //setIsSaving(true);
    //try {
      //await dispatch(toggleSave(post._id)).unwrap();
      
      // ✅ Resynchroniser après sauvegarde
      //await dispatch(getFeed({ page: 1, limit: 20, refresh: true })).unwrap();
      
    //} catch (error: any) {
      //Alert.alert('Erreur', error?.message || 'Impossible de sauvegarder la publication');
      
      // Resynchroniser en cas d'erreur
      //await dispatch(getFeed({ page: 1, limit: 20, refresh: true })).unwrap();
    //} finally {
      //setIsSaving(false);
    //}
  //};

  // ✅ FONCTION COMMENTAIRE AVEC SYNCHRO DB
  const handleCreateComment = async () => {
    if (!commentText.trim() || !currentUser || isCommenting) return;
    
    setIsCommenting(true);
    
    try {
      await dispatch(createComment({
        postId: post._id,
        content: { text: commentText.trim() }
      })).unwrap();
      
      setCommentText('');
      
      // ✅ Recharger les commentaires ET le feed
      await Promise.all([
        dispatch(getCommentsByPost({ postId: post._id, page: 1, limit: 10 })).unwrap(),
      ]);
      
    } catch (error: any) {
      Alert.alert('Erreur', error?.message || 'Impossible de publier le commentaire');
    } finally {
      setIsCommenting(false);
    }
  };

  useEffect(() => {
    // ✅ Charger les commentaires initiaux si showComments est true
    if (showComments) {
      dispatch(getCommentsByPost({ postId: post._id, page: 1, limit: 10 }));
      setShowCommentsSection(true);
    }
  }, [showComments, post._id, dispatch]);

  // ✅ GESTION DES COMMENTAIRES
  const handleLoadComments = async () => {
    if (!showCommentsSection) {
      try {
        await dispatch(getCommentsByPost({ postId: post._id, page: 1, limit: 10 })).unwrap();
        setShowCommentsSection(true);
      } catch (error) {
        console.error('Erreur chargement commentaires:', error);
        Alert.alert('Erreur', 'Impossible de charger les commentaires');
      }
    } else {
      setShowCommentsSection(false);
    }
  };

  // ✅ FONCTION DE PARTAGE AVEC GESTION D'ERREUR
const sharePostToSocial = async (): Promise<void> => {
  try {
    // ✅ Vérifier si le partage est disponible
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (!isSharingAvailable) {
      Alert.alert('Partage non disponible', 'La fonction de partage n\'est pas disponible sur cet appareil.');
      return;
    }

    // ✅ CRÉER LE LIEN ET MESSAGE
    const postUrl: string = `https://votreapp.com/post/${post._id}`;
    
    let shareMessage: string = 'Regarde cette publication ! 👀\n\n';
    
    // Ajouter le contenu du post si disponible
    if (post.content?.text) {
      const textPreview: string = post.content.text.length > 100 
        ? post.content.text.substring(0, 100) + '...' 
        : post.content.text;
      shareMessage += `"${textPreview}"\n\n`;
    }
    
    shareMessage += `${postUrl}`;

    // ✅ OUVRIR LE SÉLECTEUR DE PARTAGE
    await Sharing.shareAsync(shareMessage, {
      dialogTitle: 'Partager cette publication',
      mimeType: 'text/plain',
      UTI: 'public.plain-text', // Pour iOS
    });

    console.log('✅ Partage social réussi');

  } catch (error: any) {
    console.error('❌ Erreur partage social:', error);
    // Ne pas afficher d'alerte si l'utilisateur a simplement annulé
    if (error.code !== 'ERR_SHARING_CANCELLED') {
      Alert.alert('Erreur', 'Impossible de partager la publication');
    }
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
            setIsDeleted(true); // ← C'EST LA CLÉ
            await dispatch(deletePost(post._id)).unwrap();
          } catch (error: any) {
            setIsDeleted(false);
            Alert.alert('Erreur', error?.message || 'Impossible de supprimer la publication');
          }
        },
      },
    ]
  );
};

// ✅ BLOQUE TOUT RENDU SI SUPPRIMÉ
if (isDeleted) return null;

  // ✅ Afficher les options SEULEMENT si l'utilisateur est l'auteur
  const showOptions = () => {
    if (!isOwnPost) return;

    const options = [
      { text: 'Annuler', style: 'cancel' as const },
      {
        text: 'Modifier',
        onPress: () => {
          setPostToEdit(post);
          setIsEditModalVisible(true)
        }

      },
      {
        text: 'Supprimer',
        style: 'destructive' as const,
        onPress: () => handleDelete(),
      },
      {
        text: 'Partager',
        onPress: () => Alert.alert('Partager', 'Fonction de partage'),
      },
    ];

    Alert.alert('Options', 'Que voulez-vous faire ?', options);
  };

  

  // Rendu du header avec infos utilisateur
  const renderHeader = () => (
    
    <View className="flex-row items-center justify-between p-4 pb-3 dark:bg-black">
      <TouchableOpacity 
        className="flex-row items-center flex-1"
        onPress={() => {
          if (post.author._id) {
            router.push(`../(modals)/userProfile/${post.author._id}`)
          }
        }}
      >
        {post.author.profilePicture ? (
          <Image
            source={{ uri: post.author.profilePicture}}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
            <User size={20} color="#64748b" />
          </View>
        )}
        
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900 dark:text-gray-200 text-base">
            {post.author.username || 'Utilisateur inconnu'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-slate-500 dark:text-gray-400 text-sm">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Date inconnue'}
            </Text>
            
            {post.createdAt && post.updatedAt && post.createdAt !== post.updatedAt && (
              <Text className="text-slate-400 text-xs ml-2">
                • modifié
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {showActions && isOwnPost && (
        <TouchableOpacity onPress={showOptions} className="p-2">
          <MoreVertical size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Rendu du contenu texte
  const renderTextContent = () => {
    if (!postContent.text) return null;

    const shouldTruncate = postContent.text.length > MAX_TEXT_LENGTH && !showFullText;
    const displayText = shouldTruncate 
      ? postContent.text.substring(0, MAX_TEXT_LENGTH) + '...' 
      : postContent.text;

    return (
      <View className="px-4 pb-3 dark:bg-black">
        <Text className="text-slate-900 dark:text-gray-100 text-base leading-6">
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

  // Rendu des médias (inchangé)
  const renderMedia = () => {
    const images = postMedia.images || [];
    const videos = postMedia.videos || [];
    const mediaFull = [...images, ...videos];

    if (images.length === 0 && videos.length === 0) return null;

    return (
      <View className="px-4 pb-3 dark:bg-black">
  {/* Images + Vidéo dans la même grille */}
  {(images.length > 0 || videos.length > 0) && (
    <View className={`${(images.length + videos.length) > 1 ? 'flex-row flex-wrap' : ''} gap-2`}>
      {/* Afficher les 4 premiers médias (images ou vidéo) */}
      {[...images, ...videos.slice(0, 1)].slice(0, 4).map((media: any, index: number) => (
        <View 
          key={index} 
          className={`${
            (images.length + videos.length) === 1 ? 'w-full h-[470px]' :
            (images.length + videos.length) === 2 ? 'w-[48%] aspect-square' :
            (images.length + videos.length) === 3 ? index === 0 ? 'w-full aspect-video' : 'w-[48%] aspect-square' :
            'w-[48%] aspect-square'
          } rounded-xl overflow-hidden bg-slate-200`}
        >
          <TouchableOpacity onPress={() => openFullScreen(index)} activeOpacity={0.8}>
            {/* Vérifier si c'est une image ou une vidéo */}
            {videos.length > 0 && index >= images.length ? (
              // ✅ C'EST LA VIDÉO
              <VideoPlayerItem
                uri={media.url || media}
                isVisible={isPlaying}
               
              />
            ) : (
              // ✅ C'EST UNE IMAGE
              <Image
                source={{ uri: media.url || media }}
                className="w-full h-full"
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            )}
          </TouchableOpacity>
          
          {/* ✅ OVERLAY AVEC COMPTEUR INCLUANT LA VIDÉO */}
          {(images.length + videos.length) > 4 && index === 3 && (
            <TouchableOpacity 
              onPress={() => openFullScreen(3)}
              className="absolute inset-0 bg-black/50 dark:bg-white/50 items-center justify-center"
            >
              <Text className="text-white dark:text-black font-bold text-lg">
                +{(images.length + videos.length) - 4}
              </Text>
            </TouchableOpacity>
          )}

          {/* ✅ BADGE POUR LA VIDÉO DANS LA GRILLE */}
          {videos.length > 0 && index >= images.length && (
            <View className="absolute top-2 left-2 bg-black/70 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-medium">VIDÉO</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  )}
</View>
    );
  };


  // ✅ Rendu du formulaire de commentaire
  const renderCommentForm = () => (
    <View className="px-4 pb-3  dark:my-3 dark:bg-black pt-3">
      <View className="flex-row items-center">
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Ajouter un commentaire..."
          placeholderTextColor="#94a3b8"
          className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-slate-800 dark:text-gray-300 text-sm border border-slate-200"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleCreateComment}
          disabled={!commentText.trim() || isCommenting}
          className="ml-2 bg-blue-600 p-2 rounded-full"
        >
          {isCommenting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Rendu de la section commentaires
  const renderCommentsSection = () => {
    if (!showCommentsSection) return null;

    return (
      <View className="border-t border-slate-100 dark:border-gray-500 dark:bg-black">
        {/* En-tête commentaires */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-slate-50 dark:bg-black ">
          <Text className="font-semibold text-slate-900 dark:text-gray-100">
            Commentaires ({comments.length})
          </Text>
          <TouchableOpacity onPress={() => setShowCommentsSection(false)}>
            <X size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Liste des commentaires */}
        {commentsLoading ? (
          <View className="py-8 items-center">
            <CommentCardSkeleton/>
          </View>
        ) : comments.length > 0 ? (
          <ScrollView className="max-h-80" >
            {comments.map(comment => (
              <CommentCard
                key={comment._id}
                comment={comment}
                postId={post._id}
                showReplies={false}
                onReply={(comment) => console.log('Répondre à:', comment)}
                onEdit={(comment) => console.log('Modifier:', comment)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="py-8 items-center">
            <Text className="text-slate-500">Aucun commentaire pour le moment</Text>
            <Text className="text-slate-400 text-sm mt-1">
              Soyez le premier à commenter !
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ✅ RENDU DES ACTIONS AVEC SYNCHRO DB
  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View className="px-4 pb-3 dark:bg-black">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2 gap-x-6">
            {/* ✅ BOUTON LIKE AVEC ÉTAT DB */}
            <TouchableOpacity 
              onPress={handleLike}
              disabled={!currentUser || isLiking}
              className="flex-row items-center"
            >
              
                <Heart 
                  size={22} 
                  color={localIsLiked ? "#ef4444" : "#64748b"} 
                  fill={localIsLiked ? "#ef4444" : "transparent"} 
                />
            
              <Text className={`ml-2 font-medium ${localIsLiked ? 'text-red-500' : 'text-slate-600'}`}>
                {localLikesCount}
              </Text>
            </TouchableOpacity>

            {/* ✅ COMMENTAIRES */}
            <TouchableOpacity 
              onPress={handleLoadComments}
              className="flex-row items-center"
            >
              <MessageCircle size={22} color="#64748b" />
              <Text className="ml-2 text-slate-600 font-medium">
                {engagement.commentsCount || engagement.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity 
              onPress={sharePostToSocial}
              className="flex-row items-center">
              <Share size={22} color="#64748b" />
              <Text className="ml-2 text-slate-600 font-medium">
                {engagement.sharesCount || 0}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save 
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
          </TouchableOpacity> */}
        </View>

        {/* ✅ Formulaire de commentaire */}
        {renderCommentForm()}
      </View>
    );
  };

  // Rendu version compacte
  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        onPress={() => onPress?.(post)}
        className="bg-white border-b border-slate-200 dark:bg-black dark:border-gray-500 active:bg-slate-50"
      >
        {renderHeader()}
        {renderTextContent()}
        {renderMedia()}
        
      </TouchableOpacity>
    );
  }

  // Rendu version détaillée (par défaut)
  return (
    <View className="bg-white dark:bg-black border-t border-slate-200 dark:border-gray-500">
      {renderHeader()}
      
      <TouchableOpacity onPress={() => onPress?.(post)} activeOpacity={0.9}>
        {renderTextContent()}
        {renderMedia()}
      </TouchableOpacity>

      {renderActions()}
      
      {/* ✅ Section commentaires */}
      {renderCommentsSection()}


      <MediaFullScreen
      post={post}
      initialIndex={initialMediaIndex}
      onClose={() => setFullScreenVisible(false)}
      isVisible={fullScreenVisible}
    />

    {/* Pour Modifier*/}
    <CreatePost isVisible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setPostToEdit(null)
        }}
        onSuccess={() => {
        setIsEditModalVisible(false);
        setPostToEdit(null);
        // Optionnel: Recharger les données
        dispatch(getFeed({ page: 1, limit: 20, refresh: true }));
        }}

        editPost={postToEdit}
        />
    </View>

    
  );
};


export default PostCard;