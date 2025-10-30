// components/Stories/StoryViewer.tsx (version améliorée)
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
const STORY_DURATION = 5000; // 5 secondes

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
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);

  const stories = userStories || [];
  const currentStory = stories[currentStoryIndex];

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (visible && initialStory && stories.length > 0) {
      const initialIndex = stories.findIndex(s => s._id === initialStory._id);
      setCurrentStoryIndex(Math.max(initialIndex, 0));
      setProgress(0);
      startProgress();
      
      // Marquer comme vu
      if (stories[Math.max(initialIndex, 0)]) {
        markAsViewed(stories[Math.max(initialIndex, 0)]);
      }
    }

    return () => {
      stopProgress();
    };
  }, [visible, initialStory, stories]);

  const startProgress = useCallback(() => {
    stopProgress();
    startTime.current = Date.now();
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = elapsed / STORY_DURATION;
      
      if (newProgress >= 1) {
        nextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50) as unknown as NodeJS.Timeout;
  }, [currentStoryIndex, stories.length]);

  const stopProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const nextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      markAsViewed(stories[currentStoryIndex + 1]);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length]);

  const previousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
      markAsViewed(stories[currentStoryIndex - 1]);
    }
  }, [currentStoryIndex]);

  const markAsViewed = useCallback(async (story: IStoryPopulated) => {
    if (!story || story.hasViewed || !currentUser) return;
    
    // Mise à jour optimiste
    viewStoryOptimistic({ 
      storyId: story._id, 
      userId: currentUser._id 
    });
    
    try {
      await viewStory(story._id);
    } catch (error) {
      console.error('Erreur lors du marquage comme vue:', error);
    }
  }, [currentUser, viewStory, viewStoryOptimistic]);

  const handleClose = useCallback(() => {
    stopProgress();
    onClose();
  }, [onClose, stopProgress]);

  // Gestion des gestes tactiles
  const handleTouchStart = useCallback(() => {
    stopProgress();
  }, [stopProgress]);

  const handleTouchEnd = useCallback(() => {
    startProgress();
  }, [startProgress]);

  if (!currentStory || !visible) {
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
        <View 
          className="flex-1 justify-center items-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentStory.content.type === 'image' ? (
            <Image
              source={{ uri: currentStory.content.data }}
              style={{ width, height: height - 150 }}
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
            onPress={previousStory}
          />
          <TouchableOpacity 
            className="flex-1"
            onPress={nextStory}
          />
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