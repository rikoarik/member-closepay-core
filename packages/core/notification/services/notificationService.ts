/**
 * Features Notification - Notification Service
 * Service untuk mengelola notifications
 */

import { Notification } from '../models/Notification';

export interface NotificationService {
  getNotifications(filters?: NotificationFilters): Promise<Notification[]>;
  getNotification(notificationId: string): Promise<Notification>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  sendPushNotification(token: string, notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void>;
  showInfoPopup(title: string, message: string): void;
}

export interface NotificationFilters {
  type?: Notification['type'];
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Verifikasi Email',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    type: 'error',
    isRead: false,
    createdAt: new Date('2022-10-31T10:00:00+07:00'),
  },
  {
    id: 'notif-2',
    title: 'Verifikasi Email',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    type: 'info',
    isRead: true,
    createdAt: new Date('2022-10-31T10:00:00+07:00'),
  },
  {
    id: 'notif-3',
    title: 'Verifikasi Email',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    type: 'info',
    isRead: true,
    createdAt: new Date('2022-10-31T10:00:00+07:00'),
  },
];

class NotificationServiceImpl implements NotificationService {
  private notifications: Notification[] = mockNotifications;

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    let results = [...this.notifications];

    if (filters?.type) {
      results = results.filter(notification => notification.type === filters.type);
    }

    if (typeof filters?.isRead === 'boolean') {
      results = results.filter(notification => notification.isRead === filters.isRead);
    }

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? results.length;

    return results.slice(offset, offset + limit);
  }

  async getNotification(notificationId: string): Promise<Notification> {
    const notification = this.notifications.find(n => n.id === notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async markAsRead(notificationId: string): Promise<void> {
    this.notifications = this.notifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification,
    );
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
  }

  async sendPushNotification(
    token: string,
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      isRead: false,
    };

    // Simpan di paling atas list untuk mock
    this.notifications = [newNotification, ...this.notifications];
  }

  showInfoPopup(title: string, message: string): void {
    // TODO: Implement info popup display
    console.log(`[INFO POPUP] ${title}: ${message}`);
  }
}

export const notificationService: NotificationService = new NotificationServiceImpl();

