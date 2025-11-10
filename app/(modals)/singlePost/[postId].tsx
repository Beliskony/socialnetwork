// app/(tabs)/posts/[id].tsx
import React, { useEffect, useCallback } from 'react';
import { 
  useLocalSearchParams, 
  useRouter 
} from 'expo-router';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  getPostById, 
  deletePost,
  toggleLike 
} from '@/redux/postSlice';
import { getCommentsByPost } from '@/redux/commentSlice';
import PostSkeleton from '@/components/skeletons/SkeletonPostItem';
import PostCard from '@/components/Posts/PostCard';
import { ArrowLeft } from 'lucide-react-native';
import RetourConnexion from '@/components/homescreen/RetourConnexion';

const SinglePostScreen = () => {
  const { postId } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // ✅ Sélection correcte du state
  const { 
    currentPost, 
    loading: postLoading, 
    error: postError 
  } = useAppSelector((state) => state.posts);
  // ✅ LOGS DE DEBUG
  console.log('🔍 DEBUG SinglePostScreen:', {
    postId,
    hasId: !! postId,
    currentPost: currentPost ? `✅ ${currentPost._id}` : '❌ null',
    loading: postLoading,
    error: postError
  });

  const { currentUser } = useAppSelector((state) => state.user);

  // ✅ Chargement des données
  useEffect(() => {
    if (postId && typeof postId === 'string') {
      console.log('🎯 Chargement du post ID:', postId);
      loadPostData();
    }
  }, [postId, dispatch]);

  const loadPostData = async () => {
    try {
      await dispatch(getPostById(postId as string)).unwrap();
      // Charger les commentaires aussi
      await dispatch(getCommentsByPost({ 
        postId: postId as string, 
        page: 1, 
        limit: 50 
      })).unwrap();
    } catch (error) {
      console.error('❌ Erreur chargement post:', error);
    }
  };

  // ✅ Gestion des événements
  const handleEdit = useCallback((post: any) => {
    console.log('✏️ Édition du post:', post._id);
    // Navigation vers l'écran d'édition ou ouverture modal
    // router.push(`/edit-post/${post._id}`);
  }, []);

  const handlePostPress = useCallback((post: any) => {
    // Ne rien faire ou gérer le press sur le post
    console.log('📱 Post pressé:', post._id);
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    console.log('👤 Navigation vers profil:', userId);
    router.push(`/(modals)/userProfile/${userId}`);
  }, [router]);

  const handleCommentPress = useCallback((post: any) => {
    console.log('💬 Comment pressé pour post:', post._id);
    // Le PostCard gère déjà l'ouverture des commentaires
  }, []);

  const handleDelete = useCallback(async (postId: string) => {
    Alert.alert(
      'Supprimer la publication',
      'Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePost(postId)).unwrap();
              Alert.alert('Succès', 'Publication supprimée avec succès');
              router.back(); // Retour à l'écran précédent
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer la publication');
            }
          }
        }
      ]
    );
  }, [dispatch, router]);

  const handleLike = useCallback(async (postId: string) => {
    if (!currentUser) {
      return(
        <RetourConnexion/>
      )
    }

    try {
      await dispatch(toggleLike(postId)).unwrap();
    } catch (error: any) {
      console.error('❌ Erreur like:', error);
      Alert.alert('Erreur', 'Impossible de liker la publication');
    }
  }, [dispatch, currentUser]);

  // ✅ Gestion des états de chargement
  if (postLoading && !currentPost) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        {/* Header Skeleton */}
        <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-gray-500">
          <View className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          <View className="ml-3 flex-1">
            <View className="w-32 h-4 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
            <View className="w-24 h-3 rounded-full bg-slate-200 dark:bg-slate-600" />
          </View>
        </View>
        <PostSkeleton />
      </SafeAreaView>
    );
  }

  // ✅ Gestion des erreurs
  if (postError) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black justify-center items-center px-4">
        <Text className="text-red-500 text-lg font-semibold text-center mb-2">
          {postError.includes('non trouvé') ? 'Publication non trouvée' : 'Erreur'}
        </Text>
        <Text className="text-slate-600 dark:text-gray-400 text-center mb-4">
          {postError.includes('non trouvé') 
            ? 'Cette publication a peut-être été supprimée ou n\'existe pas.'
            : 'Impossible de charger cette publication.'
          }
        </Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-200 dark:bg-slate-700 px-6 py-3 rounded-full"
          >
            <Text className="text-slate-700 dark:text-gray-300 font-semibold">
              Retour
            </Text>
          </TouchableOpacity>
          {!postError.includes('non trouvé') && (
            <TouchableOpacity 
              onPress={loadPostData}
              className="bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Réessayer</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Post non trouvé
  if (!currentPost) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black justify-center items-center px-4">
        <Text className="text-gray-500 dark:text-gray-400 text-lg text-center mb-4">
          Publication non disponible
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Retour à l'accueil</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ✅ Affichage du post
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      {/* Header Personnalisé */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-gray-500">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <ArrowLeft size={24} color="#64748b" />
          
        </TouchableOpacity>
        
        <Text className="text-slate-900 dark:text-white font-semibold text-2xl">
          Publication
        </Text>
        
        <View className="w-6" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={postLoading}
            onRefresh={loadPostData}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <PostCard
          post={currentPost}
          onEdit={handleEdit}
          onPress={handlePostPress}
          onUserPress={handleUserPress}
          onCommentPress={handleCommentPress}
          onDelete={() => handleDelete(currentPost._id)}
          showActions={true}
          variant="detailed"
          showComments={true} // ✅ Afficher les commentaires par défaut
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SinglePostScreen;