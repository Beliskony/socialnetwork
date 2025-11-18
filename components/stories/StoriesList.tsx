// components/Stories/StoriesList.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  selectStoriesGroupedByUser, 
  selectMyStories,
  hasNewStories,
  selectCheckingNewStories, 
  selectLastChecked,
  getFollowingStories,
  getMyStories
} from '@/redux/storySlice';
import { Plus, User} from 'lucide-react-native';
import type { IStoryPopulated } from '@/intefaces/story.Interface';
import { useTheme } from '@/hooks/toggleChangeTheme';

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
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const groupedStories = useAppSelector(selectStoriesGroupedByUser);
  const myStories = useAppSelector(selectMyStories);
  const checkingNewStories = useAppSelector(selectCheckingNewStories);
  const lastChecked = useAppSelector(selectLastChecked);
  const {isDark} = useTheme()
  
  const hasActiveStories = myStories.length > 0;

  // 🔄 Charger les stories initiales
  useEffect(() => {
    loadStories();
  }, []);

  // 🔄 Vérifier les nouvelles stories périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewStories();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [lastChecked]);

  const loadStories = useCallback(async () => {
    try {
      console.log('📥 Chargement des stories...');
      await Promise.all([
        dispatch(getMyStories()),
        dispatch(getFollowingStories())
      ]);
    } catch (error) {
      console.error('❌ Erreur chargement stories:', error);
    }
  }, [dispatch]);

  const checkForNewStories = useCallback(async () => {
    try {
      // Utiliser lastChecked ou une date récente par défaut
      const checkTime = lastChecked || new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutes par défaut
      
      //console.log('🔍 Vérification nouvelles stories depuis:', checkTime);
      
      const result = await dispatch(hasNewStories(checkTime)).unwrap();
      
      if (result.hasNewStories) {
        console.log('🆕 Nouvelles stories détectées - rechargement...');
        // Recharger les stories des abonnements
        await dispatch(getFollowingStories()).unwrap();
        console.log('✅ Stories rechargées avec succès');
      } else {
        console.log('✅ Aucune nouvelle story');
      }
    } catch (error) {
      console.error('❌ Erreur vérification nouvelles stories:', error);
    }
  }, [dispatch, lastChecked]);

  // 🔄 Rafraîchir manuellement
  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel des stories');
    await loadStories();
  };

  // 1. Cercle pour CRÉER une story (toujours présent en premier)
  const renderCreateStoryCircle = () => (
    <TouchableOpacity 
      onPress={onCreateStoryPress}
      className="items-center mx-2 ml-4 py-1 gap-y-1"
    >
      <View className="relative">
        <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center">
          {/*<Plus size={30} color="white" />*/}
          <Text className='text-3xl font-semibold text-white'>S</Text>
        </View>
      </View>
      <Text className="text-xs mt-1 text-slate-700 dark:text-gray-400 max-w-16 text-center" numberOfLines={1}>
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
            <View className="bg-white dark:bg-black p-0.5 rounded-full">
              {currentUser?.profile?.profilePicture ? (
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
            <View className="absolute top-1 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </View>
        <Text className="text-xs mt-1 text-slate-700 dark:text-gray-400 max-w-16 text-center" numberOfLines={1}>
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
        <View className='relative'>
          <View className={`p-0.5 rounded-full ${
            hasUnviewed 
              ? 'bg-purple-500' 
              : 'bg-slate-400'
          }`}>
            <View className="bg-white dark:bg-black p-0.5 rounded-full">
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

          {/* Badge bleu pour stories non vues */}
          {hasUnviewed && (
            <View className="absolute top-1 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </View>
        <Text className="text-xs mt-1 text-slate-700 dark:text-gray-400 max-w-16 text-center" numberOfLines={1}>
          {user.username}
        </Text>
      </TouchableOpacity>
    );
  };


  return (
    <View className="py-4 bg-white dark:bg-black border-b border-slate-200 dark:border-gray-400">
      {/* En-tête avec bouton refresh */}
      <View className="flex-row justify-start items-center px-4 pb-2">
        <Text className="text-lg font-bold text-slate-900 dark:text-gray-200">Stories</Text>
        
      </View>

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