import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  Platform,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostItem from './PostItem';
import { Post } from '@/intefaces/post.Interface';
import NewPost from './NewPost';

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const correctUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/post/AllPosts',
        {
          headers: { Authorization: `Bearer ${correctUser.token}` },
        }
      );
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
      await axios.put(
        `https://apisocial-g8z6.onrender.com/api/like/post/${postId}`,
        { userId: correctUser._id }
      );
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    try {
      await axios.post(
        `https://apisocial-g8z6.onrender.com/api/post/${postId}/comment`,
        { userId: correctUser._id, content: comment }
      );
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };

  const handleEdit = (postId: string) => {
    console.log('Éditer post:', postId);
  };

const handleNewPost = (newPost: Post) => {
  setPosts(prev => [newPost, ...prev]);
};

  return (
<>
  <NewPost onPostCreated={handleNewPost}/>


  <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={80}>

  <FlatList
    data={posts}
    keyExtractor={(item: Post, index) => item?._id ?? index.toString()}
    renderItem={({ item }) => (
      <PostItem
        post={item}
        onLike={handleLike}
        onComment={handleComment}
        onEdit={handleEdit}
        onDelete={() => setPosts(prev => prev.filter(p => p._id !== item._id))}
      />
    )}
    ListEmptyComponent={() => (
      <Text className="text-center text-gray-500">Aucune publication trouvée.</Text>
    )}
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={{ paddingBottom: 100 }} // espace pour clavier
  />
</KeyboardAvoidingView>
</>

  );
};

export default PostsList;
