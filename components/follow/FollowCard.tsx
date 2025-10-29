import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { toggleFollow } from "@/redux/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { User } from "@/intefaces/user.Interface";

interface Props {
  userId: string;
  username: string;
  profilePicture?: string;
  fullName?: string;
  bio?: string;
  followerCount?: number;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FollowCard: React.FC<Props> = ({ 
  userId, 
  username, 
  profilePicture, 
  fullName,
  bio,
  followerCount,
  showStats = false,
  size = 'md'
}) => {
  const dispatch = useAppDispatch();
  const { currentUser, token } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur actuel suit cet utilisateur
  const isFollowing = currentUser?.social.following.includes(userId);
  const isOwnProfile = currentUser?._id === userId;

  const handleFollowToggle = async () => {
    if (!token || !currentUser) {
      dispatch(toggleFollow(userId));
      return;
    }

    if (isOwnProfile) {
      Alert.alert('Action impossible', 'Vous ne pouvez pas vous suivre vous-même');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(toggleFollow(userId)).unwrap();
      // Le state sera automatiquement mis à jour via Redux
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Une erreur est survenue lors du follow/unfollow');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles en fonction de la taille
  const getContainerStyles = () => {
    const baseStyles = "flex-row items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-4 mb-3 border border-slate-200 dark:border-slate-700";
    
    const sizeStyles = {
      sm: "py-2",
      md: "py-3", 
      lg: "py-4"
    };

    return `${baseStyles} ${sizeStyles[size]}`;
  };

  const getImageStyles = () => {
    const sizeStyles = {
      sm: "w-10 h-10",
      md: "w-12 h-12",
      lg: "w-14 h-14"
    };

    return `${sizeStyles[size]} rounded-full mr-3`;
  };

  const getButtonStyles = () => {
    const baseStyles = "px-4 rounded-full border items-center justify-center min-w-20";
    
    const sizeStyles = {
      sm: "py-1",
      md: "py-2",
      lg: "py-2"
    };

    const variantStyles = isFollowing 
      ? "bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600" 
      : "bg-blue-600 border-blue-600";

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles}`;
  };

  const getButtonTextStyles = () => {
    const baseStyles = "font-semibold";
    
    const sizeStyles = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm"
    };

    const colorStyles = isFollowing 
      ? "text-gray-700 dark:text-slate-300" 
      : "text-white";

    return `${baseStyles} ${sizeStyles[size]} ${colorStyles}`;
  };

  // Ne pas afficher le bouton sur son propre profil
  if (isOwnProfile) {
    return null;
  }

  const profileImage = profilePicture || 'https://via.placeholder.com/100';

  return (
    <View className={getContainerStyles()}>
      {/* Section utilisateur */}
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: profileImage }}
          className={getImageStyles()}
          defaultSource={{ uri: 'https://via.placeholder.com/100' }}
        />
        
        <View className="flex-1">
          <Text className="font-semibold text-slate-900 dark:text-white text-base" numberOfLines={1}>
            {fullName || username}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm" numberOfLines={1}>
            @{username}
          </Text>
          
          {showStats && bio && (
            <Text 
              className="text-slate-600 dark:text-slate-300 text-xs mt-1" 
              numberOfLines={2}
            >
              {bio}
            </Text>
          )}
          
          {showStats && followerCount !== undefined && (
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {followerCount} abonnés
            </Text>
          )}
        </View>
      </View>

      {/* Bouton Follow/Unfollow */}
      <TouchableOpacity
        onPress={handleFollowToggle}
        className={getButtonStyles()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={isFollowing ? '#6b7280' : '#ffffff'} 
          />
        ) : (
          <Text className={getButtonTextStyles()}>
            {isFollowing ? 'Suivi' : 'Suivre'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FollowCard;