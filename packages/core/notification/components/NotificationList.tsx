/**
 * Features Notification - NotificationList Component
 * Komponen list notifikasi lengkap dengan status dan refresh control
 * Responsive untuk semua device termasuk tablet
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Notification } from '../models/Notification';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getResponsiveFontSize,
  FontFamily,
  getIconSize,
} from '../../../core/config';
import { useTheme } from '../../../core/theme';
import { useTranslation } from '../../../core/i18n';
import type { ThemeColors } from '../../../core/theme';
import { NotificationBing } from 'iconsax-react-nativejs';

export interface NotificationListProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const formatDateTime = (date: Date) => {
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = date
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    .replace(':', '.');

  return `${formattedDate}   |   ${formattedTime} WIB`;
};

const getTypeStyles = (type: Notification['type'], colors: ThemeColors) => {
  switch (type) {
    case 'error':
      return {
        iconBg: colors.error,
        iconColor: colors.surface,
        highlight: colors.errorLight,
      };
    case 'success':
      return {
        iconBg: colors.success,
        iconColor: colors.surface,
        highlight: colors.successLight,
      };
    case 'warning':
      return {
        iconBg: colors.warning,
        iconColor: colors.surface,
        highlight: colors.warningLight,
      };
    case 'info':
      return {
        iconBg: colors.info,
        iconColor: colors.surface,
        highlight: colors.infoLight,
      };
    default:
      return {
        iconBg: colors.primary,
        iconColor: colors.surface,
        highlight: colors.primaryLight,
      };
  }
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
  refreshing = false,
  onRefresh,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <CustomRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
    >
      {notifications.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('notifications.empty')}
        </Text>
      ) : (
        notifications.map(notification => {
          const typeStyles = getTypeStyles(notification.type, colors);
          const createdAt =
            notification.createdAt instanceof Date
              ? notification.createdAt
              : new Date(notification.createdAt);

          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                {
                  borderBottomColor: colors.border,
                  backgroundColor: notification.isRead ? colors.surface : typeStyles.highlight,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => onNotificationPress?.(notification)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: typeStyles.iconBg }]}>
                <NotificationBing
                  size={getIconSize('medium')}
                  color={typeStyles.iconColor}
                  variant="Bold"
                />
                <View
                  style={[
                    styles.statusDot,
                    {
                      borderColor: typeStyles.iconBg,
                      backgroundColor: colors.success,
                    },
                  ]}
                />
              </View>

              <View style={styles.textContent}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text
                  style={[styles.message, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
                <Text style={[styles.date, { color: colors.textTertiary || colors.textSecondary }]}>
                  {formatDateTime(createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: moderateVerticalScale(12),
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginTop: moderateVerticalScale(32),
  },
  notificationItem: {
    padding: scale(16),
    borderRadius: scale(14),
    marginBottom: moderateVerticalScale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  iconWrapper: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: -scale(2),
    right: -scale(2),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    borderWidth: scale(2),
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(6),
  },
  message: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: getResponsiveFontSize('medium') * 1.4,
  },
  date: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(10),
  },
});
