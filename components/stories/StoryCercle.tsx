// components/Stories/StoryCircle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from 'lucide-react-native';
import type { IStoryPopulated } from '@/intefaces/story.Interface';

interface StoryCircleProps {
  story: IStoryPopulated;
  onPress: (story: IStoryPopulated) => void;
  isFirst?: boolean;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({ 
  story, 
  onPress, 
  isFirst = false 
}) => {
  const hasUnviewed = !story.hasViewed;
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(story)}
      className={`items-center mx-2 ${isFirst ? 'ml-4' : ''}`}
    >
      <View className={`relative ${hasUnviewed ? 'p-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full' : ''}`}>
        <View className="bg-white p-0.5 rounded-full">
          {story.userId.profilePicture ? (
            <Image
              source={{ uri: story.userId.profilePicture }}
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
        {story.userId.username}
      </Text>
    </TouchableOpacity>
  );
};