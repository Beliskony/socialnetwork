// app/(modals)/follow.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useTheme } from '@/hooks/toggleChangeTheme';
import { 
  Users,
  Search,
  X
} from 'lucide-react-native';

// Redux actions
import { 
  getSuggestedUsers,
  searchUsersByUsername,
  clearError,
  clearSearchedUsers
} from '@/redux/userSlice';
import type { RootState } from '@/redux/store';
import { User } from '@/intefaces/user.Interface';
import FollowCard from '@/components/follow/FollowCard';

export default function FollowScreen() {
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();

  const { 
    currentUser,
    suggestedUsers,
    searchedUsers,
    loading,
    error 
  } = useAppSelector((state: RootState) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Charger les suggestions au montage
  useEffect(() => {
    if (currentUser) {
      loadSuggestions();
    }
  }, [currentUser]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      console.error('Erreur FollowScreen:', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Recherche avec debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery.trim());
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (searchQuery.trim().length === 0 && isSearching) {
      dispatch(clearSearchedUsers());
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      await dispatch(getSuggestedUsers(20)).unwrap();
    } catch (error: any) {
      console.error('Erreur chargement suggestions:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      setIsSearching(true);
      await dispatch(searchUsersByUsername(query)).unwrap();
    } catch (error: any) {
      console.error('Erreur recherche:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      if (searchQuery.trim().length >= 2) {
        await handleSearch(searchQuery.trim());
      } else {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery]);

  const navigateToProfile = (user: User) => {
    if (user._id === currentUser?._id) {
      router.push('/(tabs)/profile');
    } else {
      //router.push(`/(modals)/user-profile?id=${user._id}`);
    }
  };

  // Filtrer les utilisateurs déjà suivis
  const getUsersToFollow = (users: User[]): User[] => {
    if (!currentUser) return users;
    
    return users.filter(user => 
      user._id !== currentUser._id && 
      !currentUser.social.following.includes(user._id)
    );
  };

  const getCurrentData = (): User[] => {
    const users = isSearching ? searchedUsers : suggestedUsers;
    return getUsersToFollow(users);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    dispatch(clearSearchedUsers());
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => navigateToProfile(item)}
      activeOpacity={0.7}
    >
      <FollowCard
        userId={item._id}
        username={item.username}
        profilePicture={item.profile.profilePicture}
        fullName={item.profile.fullName}
        bio={item.profile.bio}
        followerCount={item.analytics.followerCount}
        showStats={true}
        size="md"
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Users size={64} color={isDark ? '#475569' : '#cbd5e1'} />
      <Text className="text-lg font-semibold text-slate-500 dark:text-slate-400 mt-4 text-center">
        {isSearching ? 'Aucun résultat' : 'Aucune suggestion'}
      </Text>
      <Text className="text-slate-400 dark:text-slate-500 text-center mt-2">
        {isSearching 
          ? "Aucun utilisateur trouvé pour votre recherche"
          : "Nous n'avons pas de suggestions pour le moment"
        }
      </Text>
      {!isSearching && (
        <TouchableOpacity 
          onPress={onRefresh}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            Actualiser
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentData = getCurrentData();

  if (!currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-500 dark:text-slate-400 mt-4">
          Chargement...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      {/* Header */}
      <View className="bg-white dark:bg-black px-4 pt-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <View className="flex-row items-center justify-center mb-4">
          <Text className="text-lg font-semibold text-slate-900 dark:text-white flex-1 text-center">
            {isSearching ? 'Résultats de recherche' : 'Suggestions'}
          </Text>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-slate-100 dark:bg-white/10 rounded-xl px-3 py-2">
          <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          <TextInput
            className="flex-1 ml-2 text-slate-900 dark:text-white text-base"
            placeholder="Rechercher des profils..."
            placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Indicateur de recherche */}
      {isSearching && loading && (
        <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-200 dark:border-blue-800">
          <Text className="text-blue-600 dark:text-blue-400 text-sm text-center">
            Recherche en cours...
          </Text>
        </View>
      )}

      {/* Liste des utilisateurs à suivre */}
      <FlatList
        data={currentData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor={isDark ? '#3b82f6' : '#3b82f6'}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 16, 
          paddingVertical: 8 
        }}
        
      />
    </SafeAreaView>
  );
}