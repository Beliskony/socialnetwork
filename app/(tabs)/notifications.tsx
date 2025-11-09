import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationCard from '@/components/notifications/NotificationCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchNotificationsAsync, 
  markNotificationAsReadAsync,
  fetchMoreNotificationsAsync,
  refreshNotifications 
} from '@/redux/notificationSlice';
import { INotification } from '@/intefaces/notification.interfaces';
import NotificationCardSkeleton from '@/components/skeletons/SkeletonNotificationsCard';
import { useRouter } from 'expo-router';

const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const router= useRouter()

  // Sélectionne les données depuis le store Redux - CORRIGÉ
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    pagination 
  } = useAppSelector((state) => state.notifications); // ⚠️ Correction: 'notification' au lieu de 'notifications'

  // 🔄 Chargement initial des notifications
  useEffect(() => {
    dispatch(fetchNotificationsAsync()); // ⚠️ Correction: appel correct de la fonction
  }, [dispatch]);

  // 🔄 Gestion du refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(refreshNotifications()); // Reset la pagination
      await dispatch(fetchNotificationsAsync()).unwrap();
    } catch (error) {
      console.log('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // 🔄 Chargement de plus de notifications
  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      const nextPage = pagination.page + 1;
      dispatch(fetchMoreNotificationsAsync({ page: nextPage }));
    }
  }, [dispatch, pagination.hasMore, pagination.page, loading]);

  // 🔄 Gestion du clic sur une notification
  const handleNotificationPress = useCallback((notification: INotification) => {
    // Marquer comme lu si ce n'est pas déjà fait
    if (!notification.isRead) {
      dispatch(markNotificationAsReadAsync(notification._id)); // ⚠️ Correction: utilisation du thunk async
    }

    // Navigation selon le type de notification
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
      case 'new_post':
        if (notification.post?._id) {
          // Navigation vers le post
          router.push('../(modals)/singlePost/')
          console.log('Navigation vers post:', notification.post._id);
        }
        break;
      case 'follow':
        // Navigation vers le profil
        // navigation.navigate('Profile', { userId: notification.sender._id });
        console.log('Navigation vers profil:', notification.sender._id);
        break;
      default:
        console.log('Notification pressée:', notification._id);
    }
  }, [dispatch]);

  // 🔄 Render Item optimisé
  const renderItem = useCallback(({ item }: { item: INotification }) => (
    <NotificationCard 
      notification={item} 
      onPress={handleNotificationPress} 
    />
  ), [handleNotificationPress]);

  // 🔄 Key Extractor
  const keyExtractor = useCallback((item: INotification) => item._id, []);

  // 🎯 États de chargement et erreurs
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView className="flex flex-col bg-white">
        {/* En-tête */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-start">Notifications</Text>
        {unreadCount > 0 && (
          <Text className="text-blue-500 text-sm mt-1">
            {unreadCount} non-lue{unreadCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>
        <NotificationCardSkeleton/>
        <NotificationCardSkeleton/>
        <NotificationCardSkeleton/>
        <NotificationCardSkeleton/>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <Text className="text-red-500 text-lg font-semibold text-center">
          Erreur lors du chargement
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          {error}
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-full mt-4"
          onPress={() => dispatch(fetchNotificationsAsync())}
        >
          <Text className="text-white font-semibold">Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* En-tête */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
        {unreadCount > 0 && (
          <Text className="text-blue-500 text-sm mt-1">
            {unreadCount} non-lue{unreadCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Liste des notifications */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg font-medium text-center">
              Aucune notification
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2 px-8">
              Vous serez notifié lorsqu'il y aura de nouvelles activités concernant votre compte.
            </Text>
          </View>
        }
        ListFooterComponent={
          pagination.hasMore && notifications.length > 0 ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 text-xs mt-2">
                Chargement...
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;