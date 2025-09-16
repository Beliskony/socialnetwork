import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRoute } from "@react-navigation/native";
import OtherProfilePostsList from "@/components/Posts/OtherProfilePost";

const OtherUserProfile: React.FC = () => {
  const correctUser = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const { userId } = route.params as { userId: string };

  // Récupérer les infos du profil
  const fetchUserData = async () => {
    try {
      const res = await axios.get(`https://apisocial-g8z6.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${correctUser.token}` },
      });
      setUserData(res.data);
      setIsFollowing(res.data.followers?.includes(correctUser._id));
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Suivi / désabonnement
  const handleFollowToggle = async () => {
    try {
      await axios.post(
        `https://apisocial-g8z6.onrender.com/api/user/profile/${isFollowing ? "unfollow" : "follow"}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${correctUser.token}` } }
      );
      setIsFollowing(!isFollowing);
      fetchUserData(); // Actualise les followers après action
    } catch (error) {
      console.error("Erreur lors du suivi :", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#F1895C" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Utilisateur introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profil utilisateur */}
        <View className="items-center mb-6">
          <Image
            source={{ uri: userData.profilePicture || "https://via.placeholder.com/150" }}
            className="w-24 h-24 rounded-full mb-2"
          />
          <Text className="text-xl font-bold">{userData.username || "Utilisateur"}</Text>
          <Text className="text-gray-600">{userData.bio || ""}</Text>
        </View>

        {/* Bouton Suivre / Se désabonner */}
        <TouchableOpacity
          onPress={handleFollowToggle}
          className={`py-2 px-4 rounded-lg items-center mb-6 ${isFollowing ? "bg-red-500" : "bg-blue-500"}`}
        >
          <Text className="text-white font-semibold">{isFollowing ? "Se désabonner" : "Suivre"}</Text>
        </TouchableOpacity>

        {/* Publications de l'utilisateur */}
        <View>
          <Text className="text-lg font-bold mb-4">Publications</Text>
          <OtherProfilePostsList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtherUserProfile;
