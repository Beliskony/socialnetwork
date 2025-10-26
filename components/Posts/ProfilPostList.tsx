// components/Posts/ProfilePostsList.tsx
import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getPostsByUser, deletePost, updatePost } from '@/redux/postSlice';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '@/redux/commentSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { Post, PostFront } from '@/intefaces/post.Interface';
import { convertToPostFront } from '@/intefaces/post.Interface';
import PostCard from './PostCard';
import { Plus, X } from 'lucide-react-native';

interface ProfilePostsListProps {
  userId: string;
  showActions?: boolean;
  onPostPress?: (post: PostFront) => void;
  onUserPress?: (userId: string) => void;
  onCommentPress?: (post: PostFront) => void;
}

const ProfilePostsList = ({ 
  userId, 
  showActions = true,
  onPostPress,
  onUserPress,
  onCommentPress 
}: ProfilePostsListProps) => {
  const [editingPost, setEditingPost] = useState<PostFront | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { 
    userPosts, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.posts);
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Charger les posts de l'utilisateur au montage
  useEffect(() => {
    console.log('🚀 ProfilePostsList monté - UserId:', userId);
    
    if (userId) {
      loadUserPosts();
    }
  }, [userId]);

  // Charger les posts avec useCallback
  const loadUserPosts = useCallback(async () => {
    try {
      console.log('🔄 Début du chargement des posts utilisateur...');
      setRefreshing(true);
      
      const result = await dispatch(getPostsByUser(userId)).unwrap();
      
      console.log('✅ Posts utilisateur chargés avec succès:', {
        nombrePosts: result?.length,
        userId
      });
      
    } catch (error: any) {
      console.error('❌ Erreur détaillée loadUserPosts:', {
        message: error.message,
        userId
      });
      
      if (!refreshing) {
        Alert.alert(
          'Erreur de chargement', 
          error?.message || 'Impossible de charger les publications.'
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, userId]);

  // Pull to refresh
  const onRefresh = async () => {
    console.log('🔄 Pull to refresh déclenché');
    await loadUserPosts();
  };

  // Gérer la suppression d'un post
  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Supprimer la publication',
      'Êtes-vous sûr de vouloir supprimer cette publication ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePost(postId)).unwrap();
              Alert.alert('Succès', 'Publication supprimée avec succès');
              // Recharger les posts après suppression
              setTimeout(() => {
                loadUserPosts();
              }, 1000);
            } catch (error: any) {
              Alert.alert('Erreur', error?.message || 'Impossible de supprimer la publication');
            }
          },
        },
      ]
    );
  };

  // Gérer l'édition d'un post
  const handleEdit = (post: PostFront) => {
    console.log('✏️ Édition du post:', post._id);
    setEditingPost(post);
    setShowCreateModal(true);
  };

  // Gérer la création réussie d'un post
  const handleCreateSuccess = () => {
    console.log('✅ Création/édition réussie');
    setShowCreateModal(false);
    setEditingPost(null);
    setIsSubmitting(false);
    
    // Recharger les posts après un court délai
    setTimeout(() => {
      loadUserPosts();
    }, 1000);
  };

  // Gérer l'annulation
  const handleCancel = () => {
    console.log('❌ Création/édition annulée');
    setShowCreateModal(false);
    setEditingPost(null);
    setIsSubmitting(false);
  };

  // Gérer l'ouverture d'un post
  const handlePostPress = (post: PostFront) => {
    console.log('📖 Ouvrir le post:', post._id);
    onPostPress?.(post);
    // router.push(`/post/${post._id}`);
  };

  // Gérer l'ouverture du profil utilisateur
  const handleUserPress = (userId: string) => {
    console.log('👤 Ouvrir le profil:', userId);
    onUserPress?.(userId);
    // router.push(`/profile/${userId}`);
  };

  // Gérer l'ouverture des commentaires
  const handleCommentPress = (post: PostFront) => {
    console.log('💬 Ouvrir les commentaires:', post._id);
    onCommentPress?.(post);
  };

  // Convertir les posts en PostFront
  const userPostsFront: PostFront[] = (userPosts || []).map(post => 
    convertToPostFront(post, currentUser?._id)
  );

  // Debug des données
  console.log('📊 État actuel ProfilePostsList:', {
    userPostsLength: userPostsFront?.length,
    loading,
    error,
    userId,
    currentUser: currentUser?._id
  });

  // État de chargement initial
  if (loading && (!userPostsFront || userPostsFront.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-white py-12">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Chargement des publications...</Text>
      </View>
    );
  }

  // Erreur de chargement
  if (error && (!userPostsFront || userPostsFront.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6 py-12">
        <Text className="text-red-500 text-lg mb-4">Erreur de chargement</Text>
        <Text className="text-slate-600 text-center mb-6">
          {error || 'Une erreur est survenue lors du chargement'}
        </Text>
        <TouchableOpacity 
          onPress={loadUserPosts}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Liste des posts */}
      <FlatList
        data={userPostsFront}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => {
          console.log(`🎨 Rendu post profil ${index}:`, item._id);
          return (
            <PostCard
              post={item}
              onEdit={handleEdit}
              onPress={handlePostPress}
              onUserPress={handleUserPress}
              onCommentPress={handleCommentPress}
              onDelete={() => handleDelete(item._id)}
              showActions={showActions}
              variant="detailed"
            />
          );
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20 px-6 bg-white">
            <Text className="text-slate-600 text-xl font-semibold mb-3 text-center">
              Aucune publication
            </Text>
            <Text className="text-slate-500 text-center mb-6 leading-6">
              {currentUser?._id === userId 
                ? "Créez votre première publication pour la voir apparaître ici !" 
                : "Cet utilisateur n'a pas encore publié de contenu"
              }
            </Text>
            {currentUser?._id === userId && (
              <TouchableOpacity 
                onPress={() => setShowCreateModal(true)}
                className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Créer une publication
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          loading && userPostsFront && userPostsFront.length > 0 ? (
            <View className="py-6 bg-white">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-slate-500 text-center mt-2">
                Chargement des publications...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          flexGrow: 1,
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Overlay de chargement pendant la soumission */}
      {isSubmitting && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-slate-700 font-medium mt-3">
              {editingPost ? 'Modification...' : 'Publication...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfilePostsList;