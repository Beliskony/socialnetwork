import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { INotification } from "@/intefaces/notification.interfaces";

interface Props {
  notification: INotification;
  onPress: (notification: INotification) => void;
}

const NotificationCard: React.FC<Props> = ({ notification, onPress }) => {
  // Utiliser avatarUrl ou profilePicture selon ta donnée réelle
  const senderImage = notification.sender.profilePicture || notification.sender.profilePicture || 'https://via.placeholder.com/48';

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-3 shadow-sm"
      accessibilityLabel={`Notification de ${notification.sender.username}`}
    >
      <View className="relative mr-3">
        <Image
          source={{ uri: senderImage }}
          className="w-12 h-12 rounded-full"
        />
        {!notification.isRead && (
          <View className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-0 right-0" />
        )}
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-sm text-black">
          {notification.sender.username}
        </Text>

        <Text className="text-gray-500 text-xs">
          {notification.type === "like"
            ? "a aimé votre post"
            : notification.type === "comment"
            ? "vous a mentionné dans un commentaire"
            : notification.type === "follow"
            ? "a commencé à vous suivre"
            : ""}
        </Text>

        {notification.post?.content && (
          <Text className="text-gray-400 text-xs" numberOfLines={1}>
            {notification.post.content}
          </Text>
        )}

        <Text className="text-gray-400 text-[10px] mt-1">
          {new Date(notification.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {notification.post && (
        <Image
          source={{
            uri: "https://via.placeholder.com/48", // Remplace par l'image réelle du post si disponible
          }}
          className="w-10 h-10 rounded-lg ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default NotificationCard;
