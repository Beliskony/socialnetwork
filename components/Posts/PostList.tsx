// components/Posts/PostsList.tsx
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
import { getFeed, deletePost } from '@/redux/postSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { Post, PostFront } from '@/intefaces/post.Interface'; // ✅ Importer depuis le bon fichier
import { convertToPostFront } from '@/intefaces/post.Interface';
import PostCard from './PostCard';
import { Plus, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/toggleChangeTheme';
import PostSkeleton from '../skeletons/SkeletonPostItem';

const PostsList = () => {
  const [editingPost, setEditingPost] = useState<PostFront | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {isDark} = useTheme();

  const dispatch = useDispatch<AppDispatch>();
  const { 
    feed, 
    feedLoading, 
    feedError,
    pagination 
  } = useSelector((state: RootState) => state.posts);
  const { currentUser, token } = useSelector((state: RootState) => state.user);

  // Charger le feed au montage
  useEffect(() => {
    //console.log('🚀 PostsList monté - Token:', token ? 'présent' : 'manquant');
    //console.log('👤 Utilisateur actuel:', currentUser?._id);
    
    if (token) {
      loadFeed();
    } else {
      console.log('❌ Token manquant, impossible de charger le feed');
    }
  }, [token]);

  // Charger le feed avec useCallback
  const loadFeed = useCallback(async () => {
    try {
      console.log('🔄 Début du chargement du feed...');
      setRefreshing(true);
      
      const result = await dispatch(getFeed({ 
        page: 1, 
        limit: 20, 
        refresh: true 
      })).unwrap();
      
      //console.log('✅ Feed chargé avec succès:', {
        //nombrePosts: result.posts?.length,
        //pagination: result.pagination
      //});
      
    } catch (error: any) {
      console.error('❌ Erreur détaillée loadFeed:', {
        message: error.message,
        code: error.code
      });
      
      if (!refreshing) {
        Alert.alert(
          'Erreur de chargement', 
          error || 'Impossible de charger les publications. Vérifiez votre connexion.'
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Pull to refresh
  const onRefresh = async () => {
    //console.log('🔄 Pull to refresh déclenché');
    await loadFeed();
  };

  // Charger plus de posts
  const loadMore = () => {
    if (!feedLoading && pagination && pagination.page < pagination.totalPages) {
      console.log('📥 Chargement page suivante:', pagination.page + 1);
      dispatch(getFeed({ 
        page: pagination.page + 1, 
        limit: pagination.limit 
      }));
    } else {
      console.log('ℹ️ Pas de chargement supplémentaire:', {
        loading: feedLoading,
        page: pagination?.page,
        totalPages: pagination?.totalPages
      });
    }
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
              // Recharger le feed après suppression
              setTimeout(() => {
                loadFeed();
              }, 1000);
            } catch (error: any) {
              Alert.alert('Erreur', error || 'Impossible de supprimer la publication');
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
    
    // Recharger le feed après un court délai
    setTimeout(() => {
      loadFeed();
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
    // Navigation vers la page de détail du post
    // router.push(`/post/${post._id}`);
  };

  // Gérer l'ouverture du profil utilisateur
  const handleUserPress = (userId: string) => {
    console.log('👤 Ouvrir le profil:', userId);
    // router.push(`/profile/${userId}`);
  };

  // Gérer l'ouverture des commentaires
  const handleCommentPress = (post: PostFront) => {
    console.log('💬 Ouvrir les commentaires:', post._id);
    // Ouvrir modal ou page de commentaires
  };

  // Convertir les posts du feed en PostFront
  const feedPosts: PostFront[] = (feed || []).map(post => 
    convertToPostFront(post, currentUser?._id)
  );

  // Debug des données
  console.log('📊 État actuel:', {
    feedLength: feedPosts?.length,
    feedLoading,
    feedError,
    pagination,
    currentUser: currentUser?._id
  });

  // État de chargement initial
  if (feedLoading && (!feedPosts || feedPosts.length === 0)) {
    return (
      <>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </>
    );
  }

  // Erreur de chargement
  if (feedError && (!feedPosts || feedPosts.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <Text className="text-red-500 text-lg mb-4">Erreur de chargement</Text>
        <Text className="text-slate-600 text-center mb-6">
          {feedError || 'Une erreur est survenue lors du chargement'}
        </Text>
        <TouchableOpacity 
          onPress={loadFeed}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Aucun utilisateur connecté
  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <Text className="text-slate-600 text-xl font-semibold mb-3 text-center">
          Connectez-vous
        </Text>
        <Text className="text-slate-500 text-center mb-6 leading-6">
          Connectez-vous pour voir les publications de votre réseau
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
      
      {/* Liste des posts */}
      <FlatList
        data={feedPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => {
          console.log(`🎨 Rendu post ${index}:`, item._id);
          return (
            <PostCard
              post={item}
              onEdit={handleEdit}
              onPress={handlePostPress}
              onUserPress={handleUserPress}
              onCommentPress={handleCommentPress}
              onDelete={() => handleDelete(item._id)}
              showActions={true}
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Text className="text-slate-600 text-xl font-semibold mb-3 text-center">
              Aucune publication pour le moment
            </Text>
            <Text className="text-slate-500 text-center mb-6 leading-6">
              {currentUser 
                ? "Suivez d'autres utilisateurs ou créez votre première publication !" 
                : "Connectez-vous pour voir les publications"
              }
            </Text>
            {currentUser && (
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
          feedLoading && feedPosts && feedPosts.length > 0 ? (
            <View className="py-6">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-slate-500 text-center mt-2">
                Chargement des publications...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: currentUser ? 100 : 32,
        }}
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

export default PostsList;