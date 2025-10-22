// components/Stories/StoryProgress.tsx
import React from 'react';
import { View } from 'react-native';

interface StoryProgressProps {
  stories: any[];
  currentIndex: number;
  progress: number; // 0 to 1
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  stories,
  currentIndex,
  progress,
}) => {
  return (
    <View className="flex-row space-x-1 px-2 pt-2">
      {stories.map((_, index) => (
        <View 
          key={index}
          className="flex-1 h-1 bg-white/50 rounded-full overflow-hidden"
        >
          <View 
            className={`h-full bg-white rounded-full ${
              index < currentIndex ? 'w-full' : 
              index === currentIndex ? 'w-full' : 'w-0'
            }`}
            style={{
              transform: [{
                scaleX: index === currentIndex ? progress : 1
              }]
            }}
          />
        </View>
      ))}
    </View>
  );
};