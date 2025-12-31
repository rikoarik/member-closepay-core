# Notification Module

## Overview

Core notification module yang mengelola notifications dengan support untuk berbagai notification types, read/unread status, filtering, dan push notifications. Module ini menyediakan service, hooks, dan components untuk notification management.

**Key Features:**
- Multiple notification types (info, success, warning, error, push)
- Read/unread status management
- Notification filtering dan pagination
- Push notification support
- Pre-built notification list component
- Mock data untuk development

## Architecture

### Folder Structure

```
packages/core/notification/
├── components/          # UI components
│   └── NotificationList.tsx
├── hooks/              # React hooks
│   └── useNotifications.ts
├── models/             # Data models
│   └── Notification.ts
├── services/           # Business logic
│   └── notificationService.ts
└── index.ts           # Public exports
```

### Notification Model

```
Notification
├── id: string
├── title: string
├── message: string
├── type: 'info' | 'success' | 'warning' | 'error' | 'push'
├── isRead: boolean
├── data?: Record<string, any>
└── createdAt: Date
```

## Installation & Setup

### Dependencies

Module ini sudah terintegrasi dengan:
- `@core/config` - Responsive utilities
- `@core/theme` - Theme system
- `@core/i18n` - Internationalization
- `react-native` - React Native components

### Initialization

Notification module tidak memerlukan initialization khusus. Import dan gunakan langsung:

```typescript
import { useNotifications, notificationService } from '@core/notification';
```

## Usage Examples

### Basic Notification List

```typescript
import { useNotifications } from '@core/notification';

function NotificationScreen() {
  const { notifications, isLoading, refresh } = useNotifications();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <NotificationList
      notifications={notifications}
      onRefresh={refresh}
    />
  );
}
```

### Filtered Notifications

```typescript
import { useNotifications } from '@core/notification';

function UnreadNotifications() {
  const { notifications, unreadCount } = useNotifications({
    isRead: false, // Only unread
  });

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <NotificationList notifications={notifications} />
    </View>
  );
}
```

### Notification by Type

```typescript
import { useNotifications } from '@core/notification';

function ErrorNotifications() {
  const { notifications } = useNotifications({
    type: 'error',
  });

  return <NotificationList notifications={notifications} />;
}
```

### Mark as Read

```typescript
import { useNotifications } from '@core/notification';

function NotificationItem({ notification }) {
  const { markAsRead } = useNotifications();

  const handlePress = async () => {
    await markAsRead(notification.id);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{notification.title}</Text>
    </TouchableOpacity>
  );
}
```

### Mark All as Read

```typescript
import { useNotifications } from '@core/notification';

function NotificationHeader() {
  const { markAllAsRead } = useNotifications();

  return (
    <Button 
      title="Mark All as Read" 
      onPress={markAllAsRead}
    />
  );
}
```

### Send Push Notification

```typescript
import { notificationService } from '@core/notification';

async function sendNotification() {
  await notificationService.sendPushNotification('device-token', {
    title: 'New Message',
    message: 'You have a new message',
    type: 'info',
  });
}
```

### Show Info Popup

```typescript
import { notificationService } from '@core/notification';

function showInfo() {
  notificationService.showInfoPopup(
    'Information',
    'This is an info message'
  );
}
```

### Pagination

```typescript
import { useNotifications } from '@core/notification';

function PaginatedNotifications() {
  const { notifications } = useNotifications({
    limit: 20,
    offset: 0,
  });

  return <NotificationList notifications={notifications} />;
}
```

## API Reference

### Hooks

#### `useNotifications(filters?: NotificationFilters)`

Hook untuk access notifications dengan filtering support.

**Parameters:**
```typescript
interface NotificationFilters {
  type?: 'info' | 'success' | 'warning' | 'error' | 'push';
  isRead?: boolean;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

**Example:**
```typescript
const { notifications, unreadCount, refresh } = useNotifications({
  isRead: false,
  limit: 10,
});
```

### Services

#### `notificationService`

Notification management service.

**Methods:**
- `getNotifications(filters?: NotificationFilters): Promise<Notification[]>`
- `getNotification(notificationId: string): Promise<Notification>`
- `markAsRead(notificationId: string): Promise<void>`
- `markAllAsRead(): Promise<void>`
- `sendPushNotification(token: string, notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void>`
- `showInfoPopup(title: string, message: string): void`

**Example:**
```typescript
import { notificationService } from '@core/notification';

// Get notifications
const notifications = await notificationService.getNotifications({
  type: 'error',
  isRead: false,
});

// Mark as read
await notificationService.markAsRead('notification-id');

// Mark all as read
await notificationService.markAllAsRead();
```

### Components

#### `NotificationList`

Pre-built notification list component dengan refresh control dan selection support.

**Props:**
```typescript
interface NotificationListProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (notificationId: string, selected: boolean) => void;
}
```

**Example:**
```typescript
import { NotificationList } from '@core/notification';

<NotificationList
  notifications={notifications}
  onNotificationPress={(notification) => {
    console.log('Pressed:', notification);
  }}
  onRefresh={refresh}
  refreshing={isRefreshing}
/>
```

### Types

#### `Notification`

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'push';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}
```

#### `NotificationFilters`

```typescript
interface NotificationFilters {
  type?: Notification['type'];
  isRead?: boolean;
  limit?: number;
  offset?: number;
}
```

## Configuration

### Mock Data

Notification service menggunakan mock data untuk development. Mock data akan di-generate otomatis dengan:
- 50 notifications
- Various types (info, success, warning, error, push)
- Mix of read/unread (60% unread, 40% read)
- Dates spread over past year

### Production Implementation

Untuk production, service perlu di-update untuk:
- Load notifications dari API
- Save read status ke backend
- Integrate dengan push notification service
- Add real-time updates

## Best Practices

### ✅ DO

1. **Gunakan `useNotifications()` hook untuk reactive updates**
   ```typescript
   const { notifications, refresh } = useNotifications();
   ```

2. **Filter notifications sesuai kebutuhan**
   ```typescript
   const { notifications } = useNotifications({
     isRead: false,
     type: 'error',
   });
   ```

3. **Handle loading dan error states**
   ```typescript
   const { notifications, isLoading, error } = useNotifications();
   
   if (isLoading) return <Loading />;
   if (error) return <Error message={error.message} />;
   ```

4. **Use pagination untuk large lists**
   ```typescript
   const { notifications } = useNotifications({
     limit: 20,
     offset: 0,
   });
   ```

5. **Mark as read saat user interact**
   ```typescript
   const handlePress = async () => {
     await markAsRead(notification.id);
     // Navigate to detail
   };
   ```

### ❌ DON'T

1. **Jangan load semua notifications sekaligus**
   ```typescript
   // ❌ SALAH - might be slow
   const { notifications } = useNotifications(); // No limit
   
   // ✅ BENAR - use pagination
   const { notifications } = useNotifications({ limit: 20 });
   ```

2. **Jangan skip error handling**
   ```typescript
   // ❌ SALAH
   const { notifications } = useNotifications();
   
   // ✅ BENAR
   const { notifications, error } = useNotifications();
   if (error) {
     // Handle error
   }
   ```

3. **Jangan hardcode notification data**
   ```typescript
   // ❌ SALAH
   const notifications = [
     { id: '1', title: 'Notification' },
   ];
   
   // ✅ BENAR
   const { notifications } = useNotifications();
   ```

## Troubleshooting

### Notifications tidak ter-load

**Problem:** `notifications` array kosong.

**Solution:**
- Check service implementation (masih mock data)
- Verify filters tidak terlalu restrictive
- Check error state untuk error messages

### Unread count tidak update

**Problem:** Unread count tidak berubah setelah mark as read.

**Solution:**
- Pastikan menggunakan `markAsRead()` dari hook
- Verify `refresh()` dipanggil setelah mark as read
- Check service implementation

### Notification tidak ter-mark as read

**Problem:** `markAsRead()` tidak mengubah status.

**Solution:**
- Check service implementation (masih mock)
- Verify notification ID valid
- Check error state untuk error messages

### Component tidak responsive

**Problem:** NotificationList tidak responsive di tablet/EDC.

**Solution:**
- Component sudah menggunakan responsive utilities
- Check theme colors ter-setup dengan benar
- Verify responsive utilities dari `@core/config`

## Related Modules

- **`@core/config`** - Responsive utilities untuk component
- **`@core/theme`** - Theme system untuk styling
- **`@core/i18n`** - Internationalization untuk translations

## Implementation Notes

### Mock Data Generation

Mock data di-generate dengan:
- Random types dari available types
- Random titles dan messages
- Dates spread over past year
- Mix of read/unread status
- Some notifications dengan additional data

### Future Enhancements

1. **API Integration:**
   - Load notifications dari backend API
   - Save read status ke backend
   - Real-time updates via WebSocket

2. **Push Notifications:**
   - Integrate dengan FCM/APNS
   - Background notification handling
   - Notification actions

3. **Advanced Features:**
   - Notification grouping
   - Notification search
   - Notification categories
   - Notification preferences

