// components/Stories/StoryBlock.tsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { CreateStoryModal } from './CreateStoryModal';
import { StoriesList } from './StoriesList';
import { StoryViewer } from './StoryViewer';
import { useStories } from '@/hooks/useStories';
import { useAppSelector } from '@/redux/hooks';
import { selectStoriesGroupedByUser, selectMyStories } from '@/redux/storySlice';
import type { IStoryPopulated } from '@/intefaces/story.Interface';
import { useTheme } from '@/hooks/toggleChangeTheme';

export const StoryBlock = () => {
  const [isCreateStoryModalVisible, setIsCreateStoryModalVisible] = useState(Boolean);
  const [isStoryViewerVisible, setIsStoryViewerVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<IStoryPopulated | null>(null);
  const [selectedUserStories, setSelectedUserStories] = useState<IStoryPopulated[]>([]);
  const {isDark} = useTheme()

  const { getMyStories, getFollowingStories } = useStories();
  const groupedStories = useAppSelector(selectStoriesGroupedByUser);
  const myStories = useAppSelector(selectMyStories);
  const { currentUser } = useAppSelector((state) => state.user);

  // Charger les stories au montage
  useEffect(() => {
    const loadStories = async () => {
      try {
        await getMyStories();
        await getFollowingStories();
      } catch (error) {
        console.error('Erreur lors du chargement des stories:', error);
      }
    };

    loadStories();
  }, []);

  const handleStoryPress = (story: IStoryPopulated) => {
    // Trouver toutes les stories de cet utilisateur
    const userStories = groupedStories[story.userId._id] || [];
    
    if (userStories.length > 0) {
      setSelectedStory(story);
      setSelectedUserStories(userStories);
      setIsStoryViewerVisible(true);
    }
  };

  const handleUserStoryPress = () => {
    if (myStories.length > 0) {
      setSelectedStory(myStories[0]);
      setSelectedUserStories(myStories);
      setIsStoryViewerVisible(true);
    } else {
      setIsCreateStoryModalVisible(true);
    }
  };

  const handleStoryCreated = () => {
    // Recharger les stories après création
    getMyStories();
    getFollowingStories();
  };

  const handleCloseStoryViewer = () => {
    setIsStoryViewerVisible(false);
    setSelectedStory(null);
    setSelectedUserStories([]);
  };

  return (
    <View className="bg-white dark:bg-black">
      <CreateStoryModal
        visible={isCreateStoryModalVisible}
        onClose={() => setIsCreateStoryModalVisible(true)}
        onStoryCreated={handleStoryCreated}
      />

      <StoriesList
        onStoryPress={handleStoryPress}
        onUserStoryPress={handleUserStoryPress}
        onCreateStoryPress={() => setIsCreateStoryModalVisible(true)}
      />
      
      <StoryViewer
        visible={isStoryViewerVisible}
        onClose={handleCloseStoryViewer}
        initialStory={selectedStory || undefined}
        userStories={selectedUserStories}
      />
    </View>
  );
};