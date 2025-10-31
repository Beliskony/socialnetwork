// components/Stories/StoryViewer.tsx (version simplifiée avec VideoPlayerItem)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useStories } from '@/hooks/useStories';
import { useAppSelector } from '@/redux/hooks';
import { X, User, Eye, Volume2, VolumeX, Play, Pause } from 'lucide-react-native';
import type { IStoryPopulated } from '@/intefaces/story.Interface';
import { formatCount } from '@/services/Compteur';
import VideoPlayerItem from '../Posts/VideoPlayerItem';
import StoryVideoPlayer from './StoryVideoPlayer';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 15000;
const STORY_CONTENT_WIDTH = width;
const STORY_CONTENT_HEIGHT = height;

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
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const currentStoryId = useRef<string | null>(null);

  const stories = userStories || [];
  const currentStory = stories[currentStoryIndex];

  // PRÉCHARGEMENT INTELLIGENT
  useEffect(() => {
    if (visible && stories.length > 0) {
      stories.forEach((story) => {
        if (story.content.type === 'image') {
          Image.prefetch(story.content.data).catch(() => {});
        }
      });
    }
  }, [visible, stories]);

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (visible && initialStory && stories.length > 0) {
      const initialIndex = stories.findIndex(s => s._id === initialStory._id);
      setCurrentStoryIndex(Math.max(initialIndex, 0));
      setProgress(0);
      setVideoError(false);
      setIsPlaying(true);
      
      startProgress();
      
      if (stories[Math.max(initialIndex, 0)]) {
        markAsViewed(stories[Math.max(initialIndex, 0)]);
      }
    }

    return () => {
      stopProgress();
    };
  }, [visible, initialStory, stories]);

  // CHANGEMENT DE STORY
  useEffect(() => {
    if (visible && currentStory && currentStory._id !== currentStoryId.current) {
      stopProgress();
      currentStoryId.current = currentStory._id;
      setVideoError(false);
      setIsPlaying(true);
      
      startProgress();
      markAsViewed(currentStory);
    }
  }, [currentStoryIndex, visible, currentStory]);

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
    setIsPlaying(false);
  }, []);

  const nextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const previousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [currentStoryIndex]);

  const goToStory = useCallback((index: number) => {
    if (index >= 0 && index < stories.length) {
      setCurrentStoryIndex(index);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [stories.length]);

  const markAsViewed = useCallback(async (story: IStoryPopulated) => {
    if (!story || story.hasViewed || !currentUser) return;
    
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

  const handleTouchStart = useCallback(() => {
    stopProgress();
  }, [stopProgress]);

  const handleTouchEnd = useCallback(() => {
    startProgress();
  }, [startProgress]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleVideoError = useCallback((error: any) => {
    console.error('Erreur vidéo:', error);
    setVideoError(true);
  }, []);

  const ProgressBarCarousel = () => (
    <View className="flex-row w-full items-center justify-center gap-x-1 px-4 pt-4">
      {stories.map((story, index) => (
        <TouchableOpacity
          key={story._id}
          className={`flex-1 h-1 rounded-full overflow-hidden ${
            index === currentStoryIndex ? 'bg-white/30' : 
            index < currentStoryIndex ? 'bg-white/60' : 'bg-white/30'
          }`}
          onPress={() => goToStory(index)}
          activeOpacity={0.7}
        >
          <View className="absolute inset-0 bg-white/30 rounded-full" />
          
          {index < currentStoryIndex && (
            <View className="absolute inset-0 bg-white rounded-full" />
          )}
          
          {index === currentStoryIndex && (
            <View
              className="absolute inset-0 bg-white rounded-full"
              style={{ 
                transform: [{ translateX: `${(progress - 1) * 100}%` }] 
              }}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

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
        {/* Contenu de la story */}
        <View 
          className="flex-1 justify-center items-center mt-24"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentStory.content.type === 'image' ? (
            <Image
              source={{ uri: currentStory.content.data }}
              style={{
                width: STORY_CONTENT_WIDTH,
                height: '75%',
              }}
              resizeMode="cover"
            />
          ) : (
            <View 
              className="relative"
              style={{
                width: STORY_CONTENT_WIDTH,
                height: STORY_CONTENT_HEIGHT,
              }}
            >
              {videoError ? (
                <View className="flex-1 bg-slate-800 items-center justify-center">
                  <Text className="text-white text-lg mb-2">❌ Erreur vidéo</Text>
                  <Text className="text-white/70 text-sm text-center px-4">
                    Impossible de charger la vidéo
                  </Text>
                </View>
              ) : (
                <StoryVideoPlayer 
                  uri={currentStory.content.data}
                  isVisible={isPlaying && visible}
                />
              )}
              
            </View>
          )}
        </View>

        {/* Header groupé en haut */}
        <View className="absolute top-14 left-4 right-4">
          <View className="flex-row items-center justify-between">
            {/* User info */}
            <View className="flex-row items-center bg-black/50 rounded-full pl-1 pr-4 py-1">
              {currentStory.userId.profile?.profilePicture ? (
                <Image
                  source={{ uri: currentStory.userId.profile?.profilePicture }}
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
                  {(() => {
                    const diffMs = Date.now() - new Date(currentStory.createdAt).getTime();
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMinutes / 60);
                    const diffDays = Math.floor(diffHours / 24);

                      if (diffMinutes < 60) {
                        return `Il y a ${diffMinutes}min`;
                      } else if (diffHours < 24) {
                        return `Il y a ${diffHours}h`;
                      } else {
                        return `Il y a ${diffDays}j`;
                      }
                      })()}
                </Text>
              </View>
            </View>

            {/* Close button */}
            <TouchableOpacity 
              onPress={handleClose} 
              className="bg-black/50 rounded-full w-10 h-10 items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de progression en haut */}
        <View className="absolute top-24 left-0 right-0">
          <ProgressBarCarousel />
        </View>

        

        {/* Compteur de vues - EN BAS À DROITE */}
        <View className="absolute bottom-6 right-52">
          <View className="flex-row items-center space-x-2 gap-x-2 bg-black/50 rounded-full px-4 py-2">
            <Eye size={16} color="white" />
            <Text className="text-white/70 text-sm font-medium">
              {formatCount(currentStory.viewsCount || 0)}
            </Text>
          </View>
        </View>

        {/* Zones de navigation */}
        <View className="absolute inset-0 flex-row">
          <TouchableOpacity 
            className="flex-1"
            onPress={previousStory}
            onPressIn={handleTouchStart}
            onPressOut={handleTouchEnd}
          />
          <TouchableOpacity 
            className="flex-1"
            onPress={nextStory}
            onPressIn={handleTouchStart}
            onPressOut={handleTouchEnd}
          />
        </View>
      </View>
    </Modal>
  );
};