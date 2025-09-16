import React, { useState, useEffect } from "react";
import { ActivityIndicator, Text, View, FlatList, Animated, Easing } from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import PostItemForCurrent from "./PostItemForCurrent";
import { Post } from "@/intefaces/post.Interface";
import { selectCurrentUser } from "@/redux/userSlice";

// Skeleton pour le chargement
const SkeletonPost: React.FC = () => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity, padding: 10, marginBottom: 10, backgroundColor: "#e0e0e0", borderRadius: 8 }}>
      <View style={{ height: 20, backgroundColor: "#c0c0c0", borderRadius: 4, marginBottom: 6, width: "40%" }} />
      <View style={{ height: 15, backgroundColor: "#c0c0c0", borderRadius: 4, marginBottom: 6, width: "60%" }} />
      <View style={{ height: 120, backgroundColor: "#c0c0c0", borderRadius: 8 }} />
    </Animated.View>
  );
};

const MePost: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const correctUser = useSelector(selectCurrentUser);

  const fetchMyPosts = async () => {
    if (!correctUser?._id || !correctUser?.token) return;
    try {
      const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/user/me`, {
        headers: { Authorization: `Bearer ${correctUser.token}` },
      });
      const postsArray = (response.data.posts || []).filter((p: Post) => p?._id);
      setPosts(postsArray.reverse());
    } catch (error) {
      console.error("Erreur lors du chargement des posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!correctUser?._id || !correctUser?.token) {
      setLoading(false);
      return;
    }
    fetchMyPosts();
    const interval = setInterval(fetchMyPosts, 5000);
    return () => clearInterval(interval);
  }, [correctUser]);

  const handleLike = async (postId: string) => {
    if (!correctUser?._id) return;
    try {
      await axios.put(`https://apisocial-g8z6.onrender.com/api/like/post/${postId}`, { userId: correctUser._id });
      fetchMyPosts();
    } catch (error) {
      console.error("Erreur lors du like:", error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    if (!correctUser?._id) return;
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/post/${postId}/comment`, {
        userId: correctUser._id,
        content: comment,
      });
      fetchMyPosts();
    } catch (error) {
      console.error("Erreur lors du commentaire:", error);
    }
  };

  const handleEdit = (postId: string) => console.log("Éditer post:", postId);

  const handleDelete = async (postId: string) => {
    if (!correctUser?._id) return;
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/post/${postId}`);
      fetchMyPosts();
    } catch (error) {
      console.error("Erreur lors de la suppression du post:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        [...Array(5)].map((_, i) => <SkeletonPost key={i} />)
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
          <Text>Vous n'avez publié aucun post pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            item._id ? (
              <PostItemForCurrent
                post={item}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default MePost;
