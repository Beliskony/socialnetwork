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
import type { IUserPopulated } from '@/intefaces/comment.Interfaces';

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
  // ✅ CORRECTION : Utilisation directe des sélecteurs Redux
  const { currentUser } = useAppSelector((state) => state.user);
  const groupedStories = useAppSelector(selectStoriesGroupedByUser);
  const myStories = useAppSelector(selectMyStories);
  
  const hasActiveStories = myStories.length > 0;

  // ✅ CORRECTION : Typage correct pour la vérification des stories non vues
  const hasUnviewedStories = Object.values(groupedStories).some((stories: IStoryPopulated[]) => 
    stories.some((story: IStoryPopulated) => !story.hasViewed)
  );

  const renderUserStoryCircle = () => (
    <TouchableOpacity 
      onPress={hasActiveStories ? onUserStoryPress : onCreateStoryPress}
      className="items-center mx-2 ml-4"
    >
      <View className="relative">
        <View className={`bg-white p-0.5 rounded-full ${
          hasActiveStories ? 'border-2 border-blue-500' : ''
        }`}>
          {/* ✅ CORRECTION : currentUser typé correctement */}
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
        
        {/* Badge d'ajout */}
        <View className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-6 h-6 border-2 border-white items-center justify-center">
          <Plus size={12} color="white" />
        </View>
      </View>
      <Text className="text-xs mt-1 text-slate-700 max-w-16 text-center" numberOfLines={1}>
        Votre story
      </Text>
    </TouchableOpacity>
  );

  const renderStoryCircle = (stories: IStoryPopulated[], userId: string) => {
    const user = stories[0]?.userId;
    const hasUnviewed = stories.some((story: IStoryPopulated) => !story.hasViewed);

    if (!user) return null;

    return (
      <TouchableOpacity 
        key={userId}
        onPress={() => onStoryPress(stories[0])}
        className="items-center mx-2"
      >
        <View className={`relative ${hasUnviewed ? 'p-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full' : 'p-0.5 border-2 border-slate-300 rounded-full'}`}>
          <View className="bg-white p-0.5 rounded-full">
            {/* ✅ CORRECTION : user est bien typé comme IUserPopulated */}
            {user.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
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

  if (Object.keys(groupedStories).length === 0 && myStories.length === 0) {
    return (
      <View className="py-4 px-4 bg-white border-b border-slate-200">
        <Text className="text-slate-500 text-center">
          Aucune story disponible
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
      >
        {/* Votre story */}
        {renderUserStoryCircle()}

        {/* Stories des utilisateurs suivis */}
        {Object.entries(groupedStories).map(([userId, stories]) => 
          // ✅ CORRECTION : Typage explicite pour stories
          renderStoryCircle(stories as IStoryPopulated[], userId)
        )}
      </ScrollView>
    </View>
  );
};