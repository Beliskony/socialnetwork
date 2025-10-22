// components/Stories/StoryViewer.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { useStories } from '@/hooks/useStories';
import { useAppSelector } from '@/redux/hooks';
import { X, User, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { StoryProgress } from './StoryProgress';
import type { IStoryPopulated } from '@/intefaces/story.Interface';

const { width, height } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  onClose: () => void;
  initialStory?: IStoryPopulated;
  userStories: IStoryPopulated[];
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  onClose,
  initialStory,
  userStories,
}) => {
  const { viewStory, viewStoryOptimistic } = useStories();
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null); // ✅ Correction du type

  const stories = userStories || [];
  const currentStory = stories[currentStoryIndex];

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (visible && initialStory) {
      const initialIndex = stories.findIndex(s => s._id === initialStory._id);
      setCurrentStoryIndex(Math.max(initialIndex, 0));
      setProgress(0);
      startProgress();
      markAsViewed(currentStory);
    }

    return () => {
      // Nettoyer l'intervalle quand le composant est démonté
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [visible, initialStory]);

  const startProgress = () => {
    // Nettoyer l'intervalle existant
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // ✅ CORRECTION : Typage correct pour setInterval
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          nextStory();
          return 0;
        }
        return prev + 0.01; // 5 secondes par story
      });
    }, 50) as unknown as NodeJS.Timeout;
  };

  const pauseProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      markAsViewed(stories[currentStoryIndex + 1]);
    } else {
      onClose();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const markAsViewed = async (story: IStoryPopulated) => {
    if (!story.hasViewed && currentUser) {
      // Mise à jour optimiste
      viewStoryOptimistic({ 
        storyId: story._id, 
        userId: currentUser._id 
      });
      
      try {
        await viewStory(story._id);
      } catch (error: any) {
        console.error('Erreur lors du marquage comme vue:', error);
      }
    }
  };

  const handleClose = () => {
    pauseProgress();
    onClose();
  };

  // Gestion des gestes de navigation
  const handleSwipeLeft = () => {
    nextStory();
  };

  const handleSwipeRight = () => {
    previousStory();
  };

  if (!currentStory) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {/* Barre de progression */}
        <View className="px-2 pt-2">
          <StoryProgress
            stories={stories}
            currentIndex={currentStoryIndex}
            progress={progress}
          />
        </View>

        {/* En-tête */}
        <View className="flex-row items-center justify-between px-4 pt-4">
          <View className="flex-row items-center flex-1">
            {currentStory.userId.profilePicture ? (
              <Image
                source={{ uri: currentStory.userId.profilePicture }}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center">
                <User size={16} color="#64748b" />
              </View>
            )}
            <View className="ml-3">
              <Text className="text-white font-semibold text-sm">
                {currentStory.userId.username}
              </Text>
              <Text className="text-white/70 text-xs">
                Il y a {Math.floor((Date.now() - new Date(currentStory.createdAt).getTime()) / (1000 * 60 * 60))}h
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleClose} className="p-2">
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Contenu de la story */}
        <View className="flex-1 justify-center items-center">
          {currentStory.content.type === 'image' ? (
            <Image
              source={{ uri: currentStory.content.data }}
              style={{ width, height: height * 0.7 }}
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-96 bg-slate-800 items-center justify-center">
              <Text className="text-white text-lg">Vidéo - Lecture en boucle</Text>
              <Text className="text-white/70 text-sm mt-2">
                {currentStory.content.data}
              </Text>
            </View>
          )}
        </View>

        {/* Zones de navigation */}
        <View className="absolute inset-0 flex-row">
          <TouchableOpacity 
            className="flex-1"
            onPress={handleSwipeRight}
            onPressIn={pauseProgress}
            onPressOut={startProgress}
          />
          <TouchableOpacity 
            className="flex-1"
            onPress={handleSwipeLeft}
            onPressIn={pauseProgress}
            onPressOut={startProgress}
          />
        </View>

        {/* Boutons de navigation visuels */}
        <View className="absolute inset-y-0 left-0 justify-center">
          {currentStoryIndex > 0 && (
            <TouchableOpacity 
              onPress={handleSwipeRight}
              onPressIn={pauseProgress}
              onPressOut={startProgress}
              className="p-2"
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View className="absolute inset-y-0 right-0 justify-center">
          {currentStoryIndex < stories.length - 1 && (
            <TouchableOpacity 
              onPress={handleSwipeLeft}
              onPressIn={pauseProgress}
              onPressOut={startProgress}
              className="p-2"
            >
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row items-center justify-between px-4 pb-8">
          <Text className="text-white/70 text-sm">
            {currentStoryIndex + 1} / {stories.length}
          </Text>
          
          <View className="flex-row items-center space-x-4">
            <Text className="text-white/70 text-sm">
              👁️ {currentStory.viewsCount || 0}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};