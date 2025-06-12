import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';


const BASE_URL = 'https://apisocial-g8z6.onrender.com/api'

// ---Interfaces---
interface User{
  _id:string;
  username:string;
  photoProfile:string;
}

interface Comment{
  _id:string;
  user:User;
  text:string;
  createdAt:string;
}

interface Post {
  _id: string;
  user: User;
  image: string;
  description: string;
  location?: string;
  likesCount: number;
  liked: boolean;
  commentsCount: number;
  comments?: Comment[];
  createdAt: string;
}

// Remplace par l'id de l'utilisateur connecté (à récupérer depuis ton auth)
const CURRENT_USER_ID = "user_id_connecte";

function Actuality() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get<Post[]>('https://apisocial-g8z6.onrender.com/api/posts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des posts :', error);
    } finally {
      setLoading(false);
    }
  };

  // Like/dislike
  const handleLike = async (postId:string, liked:boolean) => {
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/posts/${postId}/like`);
      setPosts(posts =>
        posts.map(post =>
          post._id === postId
            ? { ...post, liked: !liked, likesCount: post.likesCount + (liked ? -1 : 1) }
            : post
        )
      );
    } catch (error) {
      console.error('Erreur lors du like :', error);
    }
  };

  // Supprimer un post
  const handleDeletePost = async (postId:string) => {
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/posts/${postId}`);
      setPosts(posts => posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Erreur lors de la suppression du post :', error);
    }
  };

  // Modifier un post (à compléter avec navigation ou modal)
  const handleEditPost = (post: Post) => {
    // Naviguer vers un écran d'édition ou ouvrir un modal
    Alert.alert("Editer", "Ouvre l'écran/modal d'édition ici.");
  };

  // Ajouter un commentaire (à compléter avec un input/modal)
  const handleAddComment = async (postId:string, text:string) => {
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/posts/${postId}/comments`, { text });
      fetchPosts(); // Rafraîchir les posts pour voir le nouveau commentaire
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire :', error);
    }
  };

  // Modifier un commentaire
  const handleEditComment = async (postId:string, commentId:string, text:string) => {
    try {
      await axios.put(`https://apisocial-g8z6.onrender.com/api/posts/${postId}/comments/${commentId}`, { text });
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors de la modification du commentaire :', error);
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (postId:string, commentId:string) => {
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/posts/${postId}/comments/${commentId}`);
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire :', error);
    }
  };

  // Afficher les commentaires (exemple simple)
  const fetchComments = async (postId:string) => {
    try {
      const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/posts/${postId}/comments`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires :', error);
      return [];
    }
  };

  const renderItem = ({ item }: {item:Post}) => (
    <View className="bg-white rounded-xl shadow p-3 mb-6 w-full">
      {/* Header */}
      <View className="flex flex-row items-center mb-2">
        <Image source={{ uri: item.user?.photoProfile }} className="w-10 h-10 rounded-full mr-3" />
        <View>
          <Text className="font-bold">{item.user?.username}</Text>
          <Text className="text-xs text-gray-500">{item.location}</Text>
        </View>
        {/* Boutons modifier/supprimer pour l'auteur */}
        {item.user?._id === CURRENT_USER_ID && (
          <View className="flex flex-row ml-auto">
            <TouchableOpacity onPress={() => handleEditPost(item)}>
              <Text className="text-blue-500 mr-2">Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePost(item._id)}>
              <Text className="text-red-500">Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Image du post */}
      <Image source={{ uri: item.image }} className="w-full h-64 rounded-lg bg-gray-200" resizeMode="cover" />
      {/* Actions */}
      <View className="flex flex-row items-center mt-2">
        <TouchableOpacity onPress={() => handleLike(item._id, item.liked)}>
          <Text className="text-xl mr-4">{item.liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <Text className="mr-4">{item.likesCount} J'aime</Text>
        <TouchableOpacity
          onPress={async () => {
            const comments = await fetchComments(item._id);
            // Affichage simple des commentaires avec options pour modifier/supprimer si auteur
            Alert.alert(
              "Commentaires",
              comments.length
                ? comments.map((c: Comment) =>
                    `${c.user?.username}: ${c.text}` +
                    (c.user?._id === CURRENT_USER_ID
                      ? "\n[Modifier] [Supprimer]"
                      : "")
                  ).join('\n\n')
                : "Aucun commentaire"
            );
            // Pour modifier/supprimer, tu peux ouvrir un modal ou une page dédiée
          }}
        >
          <Text>{item.commentsCount} commentaires</Text>
        </TouchableOpacity>
        {/* Ajouter un commentaire (à remplacer par un vrai input/modal) */}
        <TouchableOpacity onPress={() => handleAddComment(item._id, "Ajouter un commentaire")}>
          <Text className="ml-4 text-green-600">Commenter</Text>
        </TouchableOpacity>
      </View>
      {/* Description */}
      <Text className="mt-2">{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-2">
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  );
}

export default Actuality;