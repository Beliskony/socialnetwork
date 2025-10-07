import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Text, Platform, FlatList, Modal, View, TouchableOpacity,} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostItem from './PostItem';
import { Post } from '@/intefaces/post.Interface';
import NewPost from './NewPost';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const correctUser = useSelector((state: RootState) => state.user);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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

  const handleEdit = (post: Post) => {
    setEditingPost(post); 
  };

  return (
<>


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

  
    <Modal visible={!!editingPost} animationType="slide" onRequestClose={() => setEditingPost(null)} >
      <BlurView intensity={50} tint={Platform.OS === 'ios' ? 'light' : 'dark'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center'  }} >
        <View style={{ width:'100%', padding: 20, backgroundColor: 'white', maxHeight:'80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, borderRadius: 10, }}>
         {/* Bouton fermer */}
          <TouchableOpacity onPress={() => setEditingPost(null)} style={{ position: 'absolute', top: 4, right: 6, zIndex: 10, padding: 8, }}
            hitSlop={{ top: 5, bottom: 2, left: 10, right: 10 }} >
            <MaterialIcons name="close" size={20} color="#333" />
          </TouchableOpacity>

          {editingPost && (
            <NewPost initialPost={editingPost} onPostUpdated={(updatedPost) => {
              setPosts((prevPosts) => prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)) );
              setEditingPost(null);
            }}
            onClose={() => setEditingPost(null)} />
          )}
        </View>
      </BlurView>
    </Modal>

</>

  );
};

export default PostsList;
