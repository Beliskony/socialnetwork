import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation, useRoute } from "@react-navigation/native";
import OtherProfilePostsList from "@/components/Posts/OtherProfilePost";

const OtherUserProfile = () => {
  const correctUser = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`https://apisocial-g8z6.onrender.com/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${correctUser.token}`,
        },
      });
      setUserData(res.data);
      setIsFollowing(res.data.followers.includes(correctUser._id));
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      await axios.post(
        `https://apisocial-g8z6.onrender.com/api/user/profile/${isFollowing ? "unfollow" : "follow"}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${correctUser.token}`,
          },
        }
      );
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Erreur lors du suivi :", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Utilisateur introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="items-center mb-4">
          <Image
            source={{ uri: userData.profilePicture }}
            className="w-24 h-24 rounded-full mb-2"
          />
          <Text className="text-xl font-bold">{userData.username}</Text>
          <Text className="text-gray-600">{userData.bio}</Text>
        </View>

        <TouchableOpacity
          onPress={handleFollowToggle}
          className={`bg-${isFollowing ? "red" : "blue"}-500 py-2 px-4 rounded-lg items-center mb-4`}
        >
          <Text className="text-white font-semibold">
            {isFollowing ? "Se désabonner" : "Suivre"}
          </Text>
        </TouchableOpacity>

        <View>
          <Text className="text-lg font-bold mb-2">Publications</Text>
            <OtherProfilePostsList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtherUserProfile;
