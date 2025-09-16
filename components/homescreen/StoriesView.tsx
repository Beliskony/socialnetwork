import { View, Text, Image, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {AppDispatch, RootState } from '@/redux/store'; // adapte à ton store
import { fetchStoriesAsync } from '@/redux/storySlice';

const Stories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stories, loading, error } = useSelector((state: RootState) => state.stories);

  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchStoriesAsync());
  }, [dispatch]);

  const openStory = (storyId: string) => {
    setSelectedStory(storyId);
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  // Story sélectionnée
  const currentStory = stories.find((s) => s._id === selectedStory);

  return (
    <View className="flex-row p-2">
      {loading ? (
        // Skeleton simple
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[...Array(5)].map((_, i) => (
            <View key={i} className="items-center mx-2">
              <View className="w-12 h-12 rounded-full bg-gray-300 animate-pulse" />
              <View className="mt-1 w-10 h-3 bg-gray-300 rounded animate-pulse" />
            </View>
          ))}
        </ScrollView>
      ) : error ? (
        <Text className="text-red-500">{error}</Text>
      ) : stories.length === 0 ? (
        <Text className="text-gray-500">Aucune story disponible</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stories.map((story) => (
            <TouchableOpacity
              key={story._id}
              className="items-center mx-2"
              onPress={() => openStory(story._id)}
            >
              <Image
                source={{ uri: story.mediaUrl }}
                className="w-12 h-12 rounded-full border-2 border-orange-500"
              />
              <Text className="mt-1 text-xs text-gray-800">{story.user}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal story */}
      <Modal visible={!!currentStory} animationType="fade" transparent>
        {currentStory && (
          <View className="flex-1 bg-black/90 justify-center items-center">
            <Image
              source={{ uri: currentStory.mediaUrl }}
              className="w-[90%] h-[70%] resize-contain"
            />
            <TouchableOpacity
              className="mt-5 px-4 py-2 bg-orange-500 rounded"
              onPress={closeStory}
            >
              <Text className="text-white font-bold">Fermer</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default Stories;
