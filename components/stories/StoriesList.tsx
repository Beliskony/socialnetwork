// components/Stories/StoriesList.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppSelector } from '@/redux/hooks';
import { 
  selectStoriesGroupedByUser, 
  selectMyStories 
} from '@/redux/storySlice';
import { Plus, User } from 'lucide-react-native';
import type { IStoryPopulated } from '@/intefaces/story.Interface';

interface StoriesListProps {
  onStoryPress: (story: IStoryPopulated) => void;
  onUserStoryPress: () => void;
  onCreateStoryPress: () => void;
}

export const StoriesList: React.FC<StoriesListProps> = ({
  onStoryPress,
  onUserStoryPress,
  onCreateStoryPress,
}) => {
  const { currentUser } = useAppSelector((state) => state.user);
  const groupedStories = useAppSelector(selectStoriesGroupedByUser);
  const myStories = useAppSelector(selectMyStories);
  
  const hasActiveStories = myStories.length > 0;

  // 1. Cercle pour CRÉER une story (toujours présent en premier)
  const renderCreateStoryCircle = () => (
    <TouchableOpacity 
      onPress={onCreateStoryPress}
      className="items-center mx-2 ml-4 py-1 gap-y-1"
    >
      <View className="relative">
        <View className="w-16 h-16 rounded-full bg-blue-600   items-center justify-center">
          <Plus size={30} color="white" />
        </View>
      </View>
      <Text className="text-xs mt-1 text-slate-700 max-w-16 text-center" numberOfLines={1}>
        Créer
      </Text>
    </TouchableOpacity>
  );

  // 2. Cercle pour VOIR mes stories (seulement si j'ai des stories)
  const renderMyStoriesCircle = () => {
    if (!hasActiveStories) return null;

    const hasUnviewedStories = myStories.some(story => !story.hasViewed);

    return (
      <TouchableOpacity 
        onPress={onUserStoryPress}
        className="items-center mx-2"
      >
        <View className="relative">
          <View className={`p-0.5 rounded-full ${
            hasUnviewedStories 
              ? 'bg-blue-500' 
              : 'bg-slate-400'
          }`}>
            <View className="bg-white p-0.5 rounded-full">
              {currentUser?.profile.profilePicture ? (
                <Image
                  source={{ uri: currentUser.profile.profilePicture }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-slate-200 items-center justify-center">
                  <User size={24} color="#64748b" />
                </View>
              )}
            </View>
          </View>
          
          {/* Badge bleu pour stories non vues */}
          {hasUnviewedStories && (
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </View>
        <Text className="text-xs mt-1 text-slate-700 max-w-16 text-center" numberOfLines={1}>
          Vos stories
        </Text>
      </TouchableOpacity>
    );
  };

  // 3. Cercle pour les stories des autres utilisateurs
  const renderUserStoryCircle = (stories: IStoryPopulated[], userId: string) => {
    const user = stories[0]?.userId;
    const hasUnviewed = stories.some((story: IStoryPopulated) => !story.hasViewed);

    if (!user) return null;

    return (
      <TouchableOpacity 
        key={userId}
        onPress={() => onStoryPress(stories[0])}
        className="items-center mx-2"
      >
        <View className={`relative ${
          hasUnviewed 
            ? 'p-0.5 bg-purple-500' 
            : 'p-0.5 bg-slate-400 rounded-full'
        }`}>
          <View className="bg-white p-0.5 rounded-full">
            {user.profile?.profilePicture ? (
              <Image
                source={{ uri: user.profile?.profilePicture }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-slate-200 items-center justify-center">
                <User size={24} color="#64748b" />
              </View>
            )}
          </View>
        </View>
        <Text className="text-xs mt-1 text-slate-700 max-w-16 text-center" numberOfLines={1}>
          {user.username}
        </Text>
      </TouchableOpacity>
    );
  };

  if (Object.keys(groupedStories).length === 0 && !hasActiveStories) {
    return (
      <View className="py-4 px-4 bg-white border-b border-slate-200">
        <Text className="text-slate-500 text-center">
          Aucune story disponible. Créez la première !
        </Text>
      </View>
    );
  }

  return (
    <View className="py-4 bg-white border-b border-slate-200">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {/* 1. [➕ Créer] - Toujours en premier */}
        {renderCreateStoryCircle()}

        {/* 2. [👤 Vos stories] - Seulement si vous en avez */}
        {renderMyStoriesCircle()}

        {/* 3. [👥 User1] [👥 User2] - Stories des autres utilisateurs */}
        {Object.entries(groupedStories).map(([userId, stories]) => 
          renderUserStoryCircle(stories as IStoryPopulated[], userId)
        )}
      </ScrollView>
    </View>
  );
};