/**
 * NotificationScreen
 * Slicing UI notifikasi sesuai design
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationList, useNotifications, type Notification } from '@core/notification';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  moderateVerticalScale,
  NotificationItemSkeleton,
  ScreenHeader,
} from '@core/config';

export const NotificationScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();

  const { notifications, isLoading, refresh, markAsRead } = useNotifications();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surfaceSecondary }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ScreenHeader title={t('notifications.title')} />

        {isLoading && notifications.length === 0 ? (
          <View
            style={[
              styles.loadingState,
              {
                paddingHorizontal: horizontalPadding,
                paddingTop: moderateVerticalScale(16),
              },
            ]}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationItemSkeleton key={`skeleton-${index}`} />
            ))}
          </View>
        ) : (
          <NotificationList
            notifications={notifications}
            onNotificationPress={handleNotificationPress}
            refreshing={isLoading}
            onRefresh={refresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  loadingState: {
    flex: 1,
  },
});
