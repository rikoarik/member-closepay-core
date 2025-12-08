/**
 * LanguageSelector Component
 * Komponen untuk menampilkan language selector di phone mockup
 */
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { moderateVerticalScale } from '../../../utils/responsive';
import type { ScreenContentStyles } from '../styles';

interface LanguageSelectorProps {
  colors: {
    primary: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    inputBackground?: string;
  };
  isDark?: boolean;
  language: 'id' | 'en';
  onLanguageChange: (lang: 'id' | 'en') => void;
  styles: ScreenContentStyles;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  colors,
  isDark = false,
  language,
  onLanguageChange,
  styles: screenStyles,
}) => {
  // Menggunakan colors dari theme, tidak ada hardcode
  const containerBg = colors.surfaceSecondary;
  const inputBg = colors.inputBackground || colors.surfaceSecondary;
  const unselectedTextColor = colors.textSecondary;
  const selectedTextColor = '#FFFFFF'; // Text putih untuk selected state (kontras dengan primary)

  return (
    <View style={[screenStyles.languageScreen, { backgroundColor: colors.surface }]}>
      <View style={[screenStyles.languageHeaderBar, { backgroundColor: colors.primary }]} />
      <View style={screenStyles.languageInputFields}>
        <View style={[screenStyles.languageInput, { backgroundColor: inputBg }]} />
        <View style={[screenStyles.languageInputLong, { backgroundColor: inputBg }]} />
      </View>
      <View style={[screenStyles.languageToggleContainer, { backgroundColor: containerBg }]}>
        <TouchableOpacity
          style={[
            screenStyles.languageOption,
            language === 'id' && { backgroundColor: colors.primary },
            language !== 'id' && { backgroundColor: 'transparent' },
          ]}
          onPress={() => onLanguageChange('id')}
        >
          <Text
            style={[
              screenStyles.languageOptionText,
              { color: language === 'id' ? selectedTextColor : unselectedTextColor },
            ]}
          >
            Bahasa Indonesia
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            screenStyles.languageOption,
            language === 'en' && { backgroundColor: colors.primary },
            language !== 'en' && { backgroundColor: 'transparent' },
          ]}
          onPress={() => onLanguageChange('en')}
        >
          <Text
            style={[
              screenStyles.languageOptionText,
              { color: language === 'en' ? selectedTextColor : unselectedTextColor },
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

