// types/notifications.types.ts
import { IUserPopulated } from "./comment.Interfaces";

export type NotificationType = 'like' | 'comment' | 'follow' | 'new_post' | 'mention';

export interface INotification {
  _id: string;
  recipient: string;
  sender: IUserPopulated;
  type: NotificationType;
  post?: {
    _id: string;
    content?: string;
  };
  content?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: INotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    unreadCount: number;
    totalPages: number;
  };
}

export interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CreateNotificationPayload {
  recipientId: string;
  type: NotificationType;
  content?: string;
  postId?: string;
}

export interface MarkAsReadPayload {
  notificationId: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
}