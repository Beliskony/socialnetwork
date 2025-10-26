import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationCard from '@/components/notifications/NotificationCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchNotificationsAsync, 
  markNotificationAsReadAsync,
  markAsRead,
  fetchMoreNotificationsAsync 
} from '@/redux/notificationSlice';
import { INotification } from '@/intefaces/notification.interfaces';

const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  // Sélectionne les données depuis le store Redux - exactement comme dans votre slice
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    pagination 
  } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    // Appel correct selon votre thunk qui accepte void ou params
    dispatch(fetchNotificationsAsync());
  }, [dispatch]);

  const handleNotificationPress = (notification: INotification) => {
    if (!notification.isRead) {
      // Utilise l'action synchrone markAsRead de votre slice
      dispatch(markAsRead(notification._id));
      
      // Appel API en parallèle avec l'async thunk de votre slice
      dispatch(markNotificationAsReadAsync(notification._id));
    }
    
    // Ici tu peux ajouter ta logique de navigation
    // Exemple :
    // if (notification.post?._id) {
    //   navigation.navigate('PostDetail', { postId: notification.post._id });
    // } else if (notification.type === 'follow') {
    //   navigation.navigate('Profile', { userId: notification.sender._id });
    // }
  };

  const handleRefresh = () => {
    // Recharge les notifications depuis le début
    dispatch(fetchNotificationsAsync());
  };

  const loadMoreNotifications = () => {
    // Charge plus de notifications si disponible (infinite scroll)
    if (pagination.hasMore && !loading) {
      dispatch(fetchMoreNotificationsAsync({ 
        page: pagination.page + 1, 
        limit: pagination.limit 
      }));
    }
  };

  const renderItem = ({ item }: { item: INotification }) => (
    <NotificationCard 
      notification={item} 
      onPress={handleNotificationPress} 
    />
  );

  const renderFooter = () => {
    if (!pagination.hasMore) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0000ff" />
        <Text className="text-gray-500 text-sm mt-2">Chargement...</Text>
      </View>
    );
  };

  // État de chargement initial
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Chargement des notifications...</Text>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg mb-4">Erreur: {error}</Text>
        <Text 
          className="text-blue-500 text-base"
          onPress={handleRefresh}
        >
          Réessayer
        </Text>
      </SafeAreaView>
    );
  }

  // État vide
  if (notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-lg">Aucune notification</Text>
        <Text className="text-gray-400 text-base mt-2 text-center px-8">
          Vous serez notifié ici des nouvelles activités sur votre compte
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* En-tête avec compteur de non lus */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-bold text-black">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-red-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        
        {/* Stats supplémentaires */}
        <View className="flex-row mt-2">
          <Text className="text-gray-500 text-sm">
            {pagination.total} notification{pagination.total > 1 ? 's' : ''} au total
          </Text>
        </View>
      </View>

      {/* Liste des notifications */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 py-2"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#0000ff']}
            tintColor="#0000ff"
          />
        }
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;