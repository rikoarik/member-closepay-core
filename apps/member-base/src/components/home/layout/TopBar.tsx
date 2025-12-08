/**
 * TopBar Component
 * Header bar dengan logo, notification, dan menu
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NotificationBing, Menu } from 'iconsax-react-nativejs';
import {
  getIconSize,
  scale,
  moderateVerticalScale,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

interface TopBarProps {
  notificationCount?: number;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  notificationCount = 0,
  onNotificationPress,
  onMenuPress,
}) => {
  const { colors } = useTheme();
  const minTouchTarget = getMinTouchTarget();

  return (
    <View
      style={[
        styles.topBar,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <View
            style={[styles.logoLayer, { backgroundColor: '#3B82F6' }]}
          />
          <View
            style={[
              styles.logoLayer,
              { backgroundColor: '#8B5CF6', top: 4, left: 4 },
            ]}
          />
          <View
            style={[
              styles.logoLayer,
              { backgroundColor: '#EC4899', top: 8, left: 8 },
            ]}
          />
        </View>
      </View>

      {/* Notification & Menu */}
      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <NotificationBing
            size={getIconSize('medium')}
            color={colors.text}
            variant="Outline"
          />
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.surface }]}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Menu
            size={getIconSize('medium')}
            color={colors.text}
            variant="Outline"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    width: scale(40),
    height: scale(40),
  },
  logoCircle: {
    width: scale(40),
    height: scale(40),
    position: 'relative',
  },
  logoLayer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    position: 'absolute',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  notificationButton: {
    position: 'relative',
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: moderateVerticalScale(4),
    right: scale(4),
    borderRadius: scale(10),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  badgeText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  menuButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


