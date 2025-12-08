/**
 * NotificationCard Component
 * Komponen untuk menampilkan notification card di phone mockup
 */
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NotificationBing } from 'iconsax-react-nativejs';
import { scale } from '../../../utils/responsive';
import type { ScreenContentStyles } from '../styles';

interface NotificationCardProps {
  colors: {
    primary: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textTertiary?: string;
    border?: string;
  };
  isDark?: boolean;
  isExpanded?: boolean;
  styles: ScreenContentStyles;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  colors,
  isDark = false,
  isExpanded = false,
  styles: screenStyles,
}) => {
  // Dynamic colors based on theme - semua dari colors prop, tidak ada hardcode
  // Card background: Menggunakan surfaceSecondary untuk kontras lebih baik dengan screen background
  const cardBackground = colors.surfaceSecondary;
  // Header background: Menggunakan surface untuk kontras dengan card
  const headerBackground = colors.surface;
  const titleColor = colors.text;
  const textColor = colors.textSecondary;
  const timeColor = colors.textTertiary || colors.textSecondary;
  // Border color untuk membuat card lebih terlihat
  // Light mode: border lebih gelap untuk kontras
  // Dark mode: border lebih terang untuk kontras
  const borderColor = isDark 
    ? (colors.border || colors.textSecondary)
    : (colors.border || colors.text); // Light mode gunakan text yang lebih gelap
  
  // Dynamic shadow based on theme
  // Dark mode: shadow lebih kuat dan lebih terlihat (karena background gelap)
  // Light mode: shadow lebih subtle (karena background terang)
  const shadowColor = '#000000'; // Shadow tetap hitam untuk depth effect
  const shadowOpacity = isDark ? 0.5 : 0.2;

  return (
    <View
      style={[
        screenStyles.notificationCard,
        isExpanded && screenStyles.notificationCardExpanded,
        {
          backgroundColor: cardBackground,
          borderWidth: 1,
          borderColor: borderColor,
          borderStyle: 'solid', // Pastikan border solid
        },
        Platform.select({
          ios: {
            shadowColor: shadowColor,
            shadowOpacity: shadowOpacity,
          },
          android: {
            elevation: isDark ? 5 : 4,
          },
        }),
      ]}
    >
      <View
        style={[
          screenStyles.notificationHeader,
          isExpanded && screenStyles.notificationHeaderRounded,
          isExpanded && { backgroundColor: headerBackground },
        ]}
      >
        <NotificationBing size={scale(16)} color={colors.primary} variant="Bold" />
        <View style={screenStyles.notificationAppNameContainer}>
          <Text style={[screenStyles.notificationAppName, { color: colors.primary }]}>
            Merchant
          </Text>
          <Text style={[screenStyles.notificationAppName, { color: timeColor }]}>
            {' '}now
          </Text>
        </View>
      </View>
      <Text style={[screenStyles.notificationTitle, { color: titleColor }]}>
        Pesanan Berhasil Dibuat!
      </Text>
      {isExpanded && (
        <Text style={[screenStyles.notificationText, { color: textColor }]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet
          luctus venenatis, lectus magna fringilla urna, porttitor
        </Text>
      )}
    </View>
  );
};

