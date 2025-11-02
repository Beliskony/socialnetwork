// components/Posts/UserPostsList.tsx
import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getPostsByUser } from '@/redux/postSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { Post, PostFront } from '@/intefaces/post.Interface';
import { convertToPostFront } from '@/intefaces/post.Interface';
import PostCard from './PostCard';
import { useTheme } from '@/hooks/toggleChangeTheme';
import PostSkeleton from '../skeletons/SkeletonPostItem';

interface UserPostsListProps {
  userId: string;
  showActions?: boolean;
  onPostPress?: (post: PostFront) => void;
  onUserPress?: (userId: string) => void;
  onCommentPress?: (post: PostFront) => void;
}

const UserPostsList = ({ 
  userId, 
  showActions = true,
  onPostPress,
  onUserPress,
  onCommentPress 
}: UserPostsListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const dispatch = useDispatch<AppDispatch>();
  const { 
    userPosts, 
    loading 
  } = useSelector((state: RootState) => state.posts);
  const { currentUser } = useSelector((state: RootState) => state.user);

   // Debug
  useEffect(() => {
    console.log('🔍 DEBUG UserPostsList:');
    console.log('📱 UserId reçu:', userId);
    console.log('📦 userPosts dans le store:', userPosts?.length || 0);
    console.log('⏳ Loading state:', loading);
    console.log('👥 Auteurs des userPosts:', userPosts.map((post: any) => ({
        postId: post._id,
        authorId: post.author?._id,
        authorName: post.author?.username,
        text: post.content?.text?.substring(0, 30) + '...'
      })))
    
    if (userPosts && userPosts.length > 0) {
      console.log('👥 Auteurs des userPosts:', userPosts.map((post: any) => ({
        postId: post._id,
        authorId: post.author?._id,
        authorName: post.author?.username,
        text: post.content?.text?.substring(0, 30) + '...'
      })));
    }
  }, [userId, userPosts, loading]);

  // Charger les posts de l'utilisateur
  useEffect(() => {
    if (userId) {
      console.log('🚀 Début du chargement des posts pour userId:', userId);
      loadUserPosts();
    }
  }, [userId]);


  const loadUserPosts = useCallback(async () => {
    try {
      console.log('🔄 Chargement des posts utilisateur:', userId);
      setRefreshing(true);
      await dispatch(getPostsByUser(userId)).unwrap();
    } catch (error: any) {
      console.error('❌ Erreur chargement posts utilisateur:', error);
      Alert.alert('Erreur', 'Impossible de charger les publications');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, userId]);

  const onRefresh = async () => {
    await loadUserPosts();
  };

  // Convertir les posts en PostFront
  const posts: PostFront[] = (userPosts || []).map(post => 
    convertToPostFront(post, currentUser?._id)
  );

  // Filtrer pour n'avoir que les posts de l'utilisateur spécifique
  const userSpecificPosts = posts.filter(post => 
    post.author._id === userId
  );

  // État de chargement initial
  if (loading && userSpecificPosts.length === 0) {
    return (
      <View className="p-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
      <FlatList
        data={userSpecificPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={onPostPress}
            onUserPress={onUserPress}
            onCommentPress={onCommentPress}
            showActions={showActions}
            variant="detailed"
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Text className="text-slate-600 dark:text-gray-300 text-lg font-semibold mb-3 text-center">
              Aucune publication pour le moment
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center">
              Cet utilisateur n'a pas encore publié de contenu.
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading && userSpecificPosts.length > 0 ? (
            <View className="py-6">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-slate-500 text-center mt-2">
                Chargement...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default UserPostsList;