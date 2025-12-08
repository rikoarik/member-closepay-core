/**
 * ThemeSelector Component
 * Komponen untuk menampilkan theme selector di phone mockup
 */
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { moderateVerticalScale } from '../../../utils/responsive';
import type { ScreenContentStyles } from '../styles';

interface ThemeSelectorProps {
  colors: {
    primary: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    inputBackground?: string;
  };
  isDark?: boolean;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  styles: ScreenContentStyles;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  colors,
  isDark = false,
  themeMode,
  onThemeModeChange,
  styles: screenStyles,
}) => {
  // Menggunakan colors dari theme, tidak ada hardcode
  const containerBg = colors.surfaceSecondary;
  const inputBg = colors.inputBackground || colors.surfaceSecondary;
  const unselectedTextColor = colors.textSecondary;
  const selectedTextColor = '#FFFFFF'; // Text putih untuk selected state (kontras dengan primary)

  return (
    <View style={[screenStyles.themeScreen, { backgroundColor: colors.surface }]}>
      <View style={[screenStyles.themeHeaderBar, { backgroundColor: colors.primary }]} />
      <View style={screenStyles.themeInputFields}>
        <View style={[screenStyles.themeInput, { backgroundColor: inputBg }]} />
        <View style={[screenStyles.themeInputLong, { backgroundColor: inputBg }]} />
      </View>
      <View style={[screenStyles.themeToggleContainer, { backgroundColor: containerBg }]}>
        <TouchableOpacity
          style={[
            screenStyles.themeOption,
            themeMode === 'system' && { backgroundColor: colors.primary },
            themeMode !== 'system' && { backgroundColor: 'transparent' },
          ]}
          onPress={() => onThemeModeChange('system')}
        >
          <Text
            style={[
              screenStyles.themeOptionText,
              { color: themeMode === 'system' ? selectedTextColor : unselectedTextColor },
            ]}
          >
            Sistem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            screenStyles.themeOption,
            themeMode === 'light' && { backgroundColor: colors.primary },
            themeMode !== 'light' && { backgroundColor: 'transparent' },
          ]}
          onPress={() => onThemeModeChange('light')}
        >
          <Text
            style={[
              screenStyles.themeOptionText,
              { color: themeMode === 'light' ? selectedTextColor : unselectedTextColor },
            ]}
          >
            Light
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            screenStyles.themeOption,
            themeMode === 'dark' && { backgroundColor: colors.primary },
            themeMode !== 'dark' && { backgroundColor: 'transparent' },
          ]}
          onPress={() => onThemeModeChange('dark')}
        >
          <Text
            style={[
              screenStyles.themeOptionText,
              { color: themeMode === 'dark' ? selectedTextColor : unselectedTextColor },
            ]}
          >
            Dark
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

