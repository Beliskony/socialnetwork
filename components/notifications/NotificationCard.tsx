import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { INotification, NotificationType } from "@/intefaces/notification.interfaces";

interface Props {
  notification: INotification;
  onPress: (notification: INotification) => void;
}

const NotificationCard: React.FC<Props> = ({ notification, onPress }) => {
  const getNotificationMessage = (type: NotificationType): string => {
    switch (type) {
      case "like":
        return "a aimé votre publication";
      case "comment":
        return "a commenté votre publication";
      case "follow":
        return "a commencé à vous suivre";
      case "mention":
        return "vous a mentionné dans un commentaire";
      case "new_post":
        return "a publié un nouveau contenu";
      default:
        return "a interagi avec vous";
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const senderImage = notification.sender?.profile?.profilePicture || 'https://i.pinimg.com/736x/c1/2d/65/c12d65c2c443402df0cfa95f4930d6a8.jpg';

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`flex-row items-center bg-white rounded-xl px-4 py-3 mb-3 shadow-sm ${
        !notification.isRead ? 'border-l-4 border-blue-500' : ''
      }`}
    >
      <View className="relative mr-3">
        <Image
          source={{ uri: senderImage }}
          className="w-12 h-12 rounded-full"
        />
        {!notification.isRead && (
          <View className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute top-0 right-0" />
        )}
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-sm text-black">
          {notification.sender?.username}
        </Text>

        <Text className="text-gray-600 text-sm mt-1">
          {getNotificationMessage(notification.type)}
        </Text>

        {notification.content && (
          <Text className="text-gray-500 text-xs mt-1 italic" numberOfLines={2}>
            "{notification.content}"
          </Text>
        )}

        {notification.post?.content && (
          <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
            {notification.post?.content}
          </Text>
        )}

        <Text className="text-gray-400 text-xs mt-1">
          {formatTime(notification.createdAt)}
        </Text>
      </View>

      {notification.post && (
        <View className="w-12 h-12 bg-gray-200 rounded-lg ml-2 flex items-center justify-center">
          <Text className="text-gray-400 text-xs">📝</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationCard;