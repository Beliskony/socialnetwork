import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Text, View, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostItem from './PostItem';
import { Post } from '@/intefaces/post.Interface';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const correctUser = useSelector((state: RootState) => state.user);
  
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://apisocial-g8z6.onrender.com/api/post/AllPosts',
      {
        headers: { Authorization: `Bearer ${correctUser.token}` },
      });
      
    setPosts(response.data.reverse());
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (correctUser && correctUser.token) {
      fetchPosts();
    }
  }, [correctUser]);

  const handleLike = async (postId: string) => {
    try {
      await axios.put(`https://apisocial-g8z6.onrender.com/api/like/post/${postId}`, {
        userId: correctUser._id,
      });
      fetchPosts(); // Rafraîchit les posts
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/post/${postId}/comment`, {
        userId: correctUser._id,
        content: comment,
      });
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };

  const handleEdit = (postId: string) => {
    // À implémenter selon ta logique (naviguer vers un écran d’édition, par ex.)
    console.log('Éditer post:', postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/post/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
    }
  };

  return (
    <View style={{flex: 1, marginBottom: 30}} >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList className='flex h-full'
          data={posts}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          keyExtractor={(item: Post, index) => item?._id ?? index.toString()}
          renderItem={({ item }) => item && item._id ? (
            <PostItem
              post={item}
              onLike={handleLike}
              onComment={handleComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ): null
        }
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500">Aucune publication trouvée.</Text>
        )}
        />
      )}

    </View>
  );
};

export default PostsList;
