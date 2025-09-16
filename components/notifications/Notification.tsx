import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { INotification } from "@/intefaces/notification.interfaces";
import axios from "axios";

const Notification = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const correctUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "https://apisocial-g8z6.onrender.com/api/notifications/getNotifications",
        {
          headers: { Authorization: `Bearer ${correctUser.token}` },
        }
      );

      const fetched: INotification[] = response.data.reverse();
      setNotifications(fetched);

      console.log("Notifications fetched:", fetched);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = (notification: INotification) => {
    if (notification.type === "like" || notification.type === "comment") {
      navigation.navigate({
        name: "PostDetails",
        params: { postId: notification.post?._id },
      } as never);
    } else if (notification.type === "follow") {
      navigation.navigate({
        name: "Profile",
        params: { userId: notification.sender._id },
      } as never);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {loading ? (
        <Text>Chargement des notifications...</Text>
      ) : (
        <ScrollView>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              onPress={() => handleNotificationPress(notification)}
              className="bg-white p-4 rounded-lg shadow mb-4 my-1"
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: notification.sender.profilePicture }}
                  className="w-10 h-10 rounded-full mr-2"
                />

                <View className="flex-1">
                  <Text className="font-bold">
                    {notification.sender.username}
                  </Text>
                  <Text className="text-gray-500">
                    {notification.type === "like"
                      ? "a aimé votre post"
                      : notification.type === "comment"
                      ? "a commenté votre post"
                      : notification.type === "follow"
                      ? "vous suit"
                      : ""}
                  </Text>
                  {notification.content && (
                    <Text className="text-gray-500">{notification.content}</Text>
                  )}
                  <Text className="text-gray-400 text-xs">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Notification;
