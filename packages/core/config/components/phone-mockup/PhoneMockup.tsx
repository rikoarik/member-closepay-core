/**
 * PhoneMockup Component
 * Reusable komponen untuk menampilkan phone mockup dengan berbagai screen content
 */
import React from 'react';
import { View } from 'react-native';
import { phoneStyles, screenContentStyles } from './styles';
import {
  NotificationCard,
  QRCodeScanner,
  ThemeSelector,
  MapView,
  LanguageSelector,
} from './screens';
import type { PhoneMockupProps } from './types';

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  screenType,
  colors,
  isDark,
  themeMode = 'system',
  onThemeModeChange,
  language = 'id',
  onLanguageChange,
}) => {
  const renderScreenContent = () => {
    switch (screenType) {
      case 'notifications':
        return (
          <View
            style={[
              screenContentStyles.notificationScreen,
              { backgroundColor: colors.surface },
            ]}
          >
            <NotificationCard
              colors={colors}
              isDark={isDark}
              isExpanded={true}
              styles={screenContentStyles}
            />
            <NotificationCard
              colors={colors}
              isDark={isDark}
              styles={screenContentStyles}
            />
            <NotificationCard
              colors={colors}
              isDark={isDark}
              styles={screenContentStyles}
            />
          </View>
        );

      case 'camera':
        return <QRCodeScanner colors={colors} styles={screenContentStyles} />;

      case 'theme':
        return (
          <ThemeSelector
            colors={colors}
            isDark={isDark}
            themeMode={themeMode}
            onThemeModeChange={onThemeModeChange || (() => {})}
            styles={screenContentStyles}
          />
        );

      case 'location':
        return (
          <MapView
            colors={{
              error: colors.error || '#EF4444',
              surfaceSecondary: colors.surfaceSecondary,
            }}
            isDark={isDark}
            styles={screenContentStyles}
          />
        );

      case 'language':
        return (
          <LanguageSelector
            colors={colors}
            isDark={isDark}
            language={language}
            onLanguageChange={onLanguageChange || (() => {})}
            styles={screenContentStyles}
          />
        );

      default:
        return null;
    }
  };

  // Dynamic colors based on theme
  // Phone body (bezel): Light mode menggunakan hitam pekat, dark mode lebih terang agar terlihat
  const phoneBodyColor = isDark ? colors.textTertiary : colors.text;
  // Border: Dark mode menggunakan text (putih), light mode menggunakan hitam pekat untuk kontras maksimal
  const phoneBorderColor = isDark 
    ? (colors.border || colors.text) 
    : '#000000'; // Hitam pekat untuk light mode agar lebih kontras
  // Buttons: Menggunakan textSecondary untuk visibility
  const buttonColor = colors.textSecondary;
  // Shadow: Menggunakan overlay/backdrop color jika ada, atau hitam
  const shadowColor = '#000000'; // Shadow tetap hitam untuk depth effect
  // Screen content: Menggunakan colors.surface dari theme
  const screenContentColor = colors.surface;

  return (
    <View
      style={[
        phoneStyles.phoneBody,
        {
          backgroundColor: phoneBodyColor,
          borderColor: phoneBorderColor,
          borderWidth: 2,
          shadowColor: shadowColor,
        },
      ]}
    >
      {/* Left Side Buttons */}
      <View style={[phoneStyles.volumeUpButton, { backgroundColor: buttonColor }]} />
      <View style={[phoneStyles.volumeDownButton, { backgroundColor: buttonColor }]} />
      <View style={[phoneStyles.muteSwitch, { backgroundColor: buttonColor }]} />

      {/* Right Side Button */}
      <View style={[phoneStyles.powerButton, { backgroundColor: buttonColor }]} />

      {/* Main Screen Content */}
      <View style={[phoneStyles.screenContent, { backgroundColor: screenContentColor }]}>
        {renderScreenContent()}
      </View>
    </View>
  );
};

