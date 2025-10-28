import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationCard from '@/components/notifications/NotificationCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNotificationsAsync, markAsRead } from '@/redux/notificationSlice';
import { INotification } from '@/intefaces/notification.interfaces';
import { AppDispatch } from '@/redux/store';

const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  // Sélectionne les notifications depuis le store Redux
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const loading = useAppSelector((state: any) => state.notifications.loading);
  const error = useAppSelector((state: any) => state.notifications.error);

  useEffect(() => {
    dispatch(()=>(fetchNotificationsAsync))
  }, [dispatch]);

  const handleNotificationPress = (notification: INotification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    // Ici tu peux ajouter une navigation ou autre action
  };

  const renderItem = ({ item }: { item: INotification }) => (
    <NotificationCard notification={item} onPress={handleNotificationPress} />
  );

  if (loading) return <Text>Chargement des notifications...</Text>;
  if (error) return <Text>Erreur: {error}</Text>;
  if (notifications.length === 0) return <Text>Aucune notification</Text>;

  return (
    <SafeAreaView className="flex-1 px-4 py-2 bg-white">
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;