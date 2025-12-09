/**
 * ThemeSettingsScreen Component
 * Screen untuk mengatur tema aplikasi (Sistem, Cahaya, Gelap)
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
  TabSwitcher,
  ScreenHeader,
  type Tab,
} from '@core/config';

type ThemeModeOption = 'system' | 'light' | 'dark';

export const ThemeSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, mode: currentMode, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const themeTabs: Tab[] = [
    { id: 'system', label: t('profile.themeSystem') },
    { id: 'light', label: t('profile.themeLight') },
    { id: 'dark', label: t('profile.themeDark') },
  ];

  const handleThemeChange = (tabId: string) => {
    const newMode = tabId as ThemeModeOption;
    if (newMode === currentMode) {
      return; // Sudah sama, tidak perlu update
    }
    // Fire-and-forget: Don't await to prevent blocking/flicker
    setThemeMode(newMode).catch(error => {
      console.error('Failed to change theme:', error);
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header */}
      <ScreenHeader title={t('profile.theme')} />

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: getHorizontalPadding(),
            paddingTop: moderateVerticalScale(24),
          },
        ]}
      >
        {/* Main Card Container */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surfaceSecondary || '#F3F4F6',
            },
          ]}
        >
          {/* Top Blue Indicator */}
          <View
            style={[
              styles.topIndicator,
              {
                backgroundColor: colors.primary,
              },
            ]}
          />

          {/* Placeholder sections */}
          <View
            style={[
              styles.placeholderSmall,
              {
                backgroundColor: colors.surface || '#FFFFFF',
                opacity: 0.6,
                marginTop: moderateVerticalScale(16),
                marginBottom: moderateVerticalScale(12),
              },
            ]}
          />
          <View
            style={[
              styles.placeholderLarge,
              {
                backgroundColor: colors.surface || '#FFFFFF',
                opacity: 0.6,
                marginBottom: moderateVerticalScale(24),
              },
            ]}
          />

          {/* Theme Selection - Segmented Control */}
          <View style={styles.segmentedContainer}>
            <TabSwitcher
              variant="segmented"
              tabs={themeTabs}
              activeTab={currentMode}
              onTabChange={handleThemeChange}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: moderateVerticalScale(4),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    borderRadius: scale(16),
    padding: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topIndicator: {
    width: scale(100),
    height: scale(30),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  placeholderSmall: {
    height: moderateVerticalScale(30),
    borderRadius: scale(12),
  },
  placeholderLarge: {
    height: moderateVerticalScale(100),
    borderRadius: scale(12),
  },
  segmentedContainer: {
    marginTop: 0,
  },
});
