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

// Generate dummy notifications
const generateMockNotifications = (): Notification[] => {
  const notifications: Notification[] = [];
  const types: Notification['type'][] = ['info', 'success', 'warning', 'error', 'push'];
  const titles = [
    'Verifikasi Email',
    'Pembayaran Berhasil',
    'Transaksi Baru',
    'Saldo Berkurang',
    'Top Up Berhasil',
    'Peringatan Keamanan',
    'Pembaruan Aplikasi',
    'Promo Spesial',
    'Notifikasi Sistem',
    'Pengingat Transaksi',
    'Verifikasi Akun',
    'Reset Password',
    'Login Berhasil',
    'Logout Otomatis',
    'Pembaruan Profil',
  ];
  
  const messages = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Transaksi Anda telah berhasil diproses. Silakan cek detail transaksi untuk informasi lebih lanjut.',
    'Anda menerima pembayaran baru dari merchant. Saldo Anda telah diperbarui.',
    'Saldo Anda telah berkurang sebesar Rp 50.000 untuk transaksi pembelian.',
    'Top up saldo Anda sebesar Rp 100.000 telah berhasil. Saldo sekarang Rp 1.500.000.',
    'Kami mendeteksi aktivitas mencurigakan pada akun Anda. Silakan verifikasi identitas Anda.',
    'Aplikasi telah diperbarui ke versi terbaru. Nikmati fitur-fitur baru yang tersedia.',
    'Dapatkan diskon 20% untuk semua produk hari ini! Jangan lewatkan kesempatan ini.',
    'Sistem akan melakukan maintenance pada pukul 02:00 WIB. Beberapa layanan mungkin tidak tersedia.',
    'Jangan lupa untuk menyelesaikan transaksi yang masih pending. Batas waktu: 24 jam.',
    'Verifikasi akun Anda untuk meningkatkan keamanan. Klik link yang telah dikirim ke email Anda.',
    'Permintaan reset password Anda telah diterima. Silakan cek email untuk instruksi selanjutnya.',
    'Anda telah berhasil login ke akun Anda dari perangkat baru.',
    'Anda telah logout secara otomatis karena tidak ada aktivitas selama 30 menit.',
    'Profil Anda telah berhasil diperbarui. Perubahan akan terlihat di aplikasi.',
  ];

  const baseDate = new Date();
  baseDate.setFullYear(2024, 0, 1); // Start from Jan 1, 2024

  // Generate 50 notifications
  for (let i = 0; i < 50; i++) {
    const date = new Date(baseDate);
    // Spread dates over the past year
    const daysOffset = Math.floor(i / 2); // 2 notifications per day on average
    date.setDate(date.getDate() + daysOffset);
    
    // Randomize time
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(Math.floor(Math.random() * 60));

    const typeIndex = i % types.length;
    const titleIndex = i % titles.length;
    const messageIndex = i % messages.length;
    
    // Mix read/unread status (60% unread, 40% read)
    const isRead = i % 10 < 4;

    notifications.push({
      id: `notif-${i + 1}`,
      title: titles[titleIndex],
      message: messages[messageIndex],
      type: types[typeIndex],
      isRead,
      createdAt: date,
      // Add some data for some notifications
      data: i % 5 === 0 ? {
        transactionId: `TXN-${1000 + i}`,
        amount: (i + 1) * 10000,
        merchant: `Merchant ${i + 1}`,
      } : undefined,
    });
  }

  // Sort by date (newest first)
  return notifications.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
};

const mockNotifications: Notification[] = generateMockNotifications();

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

