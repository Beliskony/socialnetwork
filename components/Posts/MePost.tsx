import { useState, useEffect } from "react";
import { ActivityIndicator, Text, View, FlatList } from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import PostItemForCurrent from "./PostItemForCurrent";
import { Post } from "@/intefaces/post.Interface";
import { selectCurrentUser } from "@/redux/userSlice";


const MePost = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const correctUser = useSelector(selectCurrentUser);
  
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    if (!correctUser || !correctUser._id || !correctUser.token) {
      console.error("User ID or token is missing");
      setLoading(false);
      return;
    }
    if (correctUser && correctUser._id && correctUser.token) {
      console.log("Fetching posts for user:", correctUser._id);
  
      fetchMyPosts();

      //rafraîchir les posts toutes les 5 secondes
      const interval = setInterval(() => {
        console.log("Refreshing posts...");
        fetchMyPosts();
      }, 5000);
      return () => {
        if (interval) clearInterval(interval);
       } // Nettoyage de l'intervalle
    } else {
      setLoading(false);
    }
  }, [correctUser]);

  const fetchMyPosts = async () => {
    if (!correctUser ||!correctUser?._id || !correctUser?.token) {
      console.error("User ID or token is missing");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/user/me`, {
        headers: { Authorization: `Bearer ${correctUser.token}` },
      });
      // ...dans fetchMyPosts
      const postsArray = (response.data.posts || []).filter((p: Post) => p && p._id);
      console.log("Posts récupérés:", response.data.posts[0]);
      
      setPosts(postsArray.reverse());
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    } finally {
      setLoading(false);
    }
  };


   const handleLike = async (postId: string) => {
    if (!correctUser || !correctUser._id) return;
    try {
      await axios.put(`https://apisocial-g8z6.onrender.com/api/like/post/${postId}`, {
        userId: correctUser._id,
      });
      fetchMyPosts(); // Rafraîchit les posts
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    if (!correctUser || !correctUser._id) return;
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/post/${postId}/comment`, {
        userId: correctUser._id,
        content: comment,
      });
      fetchMyPosts();
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };

  const handleEdit = (postId: string) => {
    if (!correctUser || !correctUser._id) return;
    // À implémenter selon ta logique (naviguer vers un écran d’édition, par ex.)
    console.log('Éditer post:', postId);
  };

  const handleDelete = async (postId: string) => {
    if (!correctUser || !correctUser._id) return;
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/post/${postId}`);
      fetchMyPosts();
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
   <FlatList className="mb-3 flex h-full px-3"
  data={posts.filter(p => p && p._id )}
  keyExtractor={(item: Post, index) => item?._id ?? index.toString()}
  renderItem={({ item }) =>
    item && item._id ? (
      <PostItemForCurrent
        post={item}
        onLike={handleLike}
        onComment={handleComment}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ) : null
  }
  ListEmptyComponent={
    <View className="flex flex-row items-center justify-center h-full">
      <Text className="items-center justify-center">
        Vous n'avez publié aucun post pour le moment.
      </Text>
    </View>
  }
/>
      )}
    </View>
  );
}

export default MePost;