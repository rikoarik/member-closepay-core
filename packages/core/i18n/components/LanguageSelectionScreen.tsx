/**
 * LanguageSelectionScreen Component
 * Screen untuk memilih bahasa
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  getVerticalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
  ScreenHeader,
  getIconSize,
} from '@core/config';

interface LanguageOption {
  code: string;
  name: string;
}

const languages: LanguageOption[] = [
  { code: 'id', name: 'Indonesia' },
  { code: 'en', name: 'Inggris' },
];

export const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t, language: currentLanguage, setLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleSave = async () => {
    if (selectedLanguage === currentLanguage) {
      navigation.goBack();
      return;
    }

    setIsSaving(true);
    try {
      // Save language preference using context
      await setLanguage(selectedLanguage as 'id' | 'en');
      // @ts-ignore - navigation type akan di-setup nanti
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save language preference:', error);
    } finally {
      setIsSaving(false);
    }
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
      <ScreenHeader title={t('profile.selectLanguage')} />

      {/* Language List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: getHorizontalPadding() },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  minHeight: getMinTouchTarget(),
                },
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageItemLeft}>
                <View
                  style={[
                    styles.checkIcon,
                    {
                      width: getIconSize('medium'),
                      height: getIconSize('medium'),
                      borderRadius: getIconSize('medium') / 2,
                      backgroundColor: isSelected ? colors.primary : colors.border || '#E5E7EB',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: scale(12),
                    },
                  ]}
                >
                  {isSelected && (
                    <Text style={{ color: colors.surface, fontSize: getResponsiveFontSize('small') }}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.languageItemLabel,
                    {
                      color: colors.text,
                      fontSize: getResponsiveFontSize('medium'),
                    },
                  ]}
                >
                  {lang.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: getHorizontalPadding(),
            paddingBottom: insets.bottom + moderateVerticalScale(16),
            paddingTop: moderateVerticalScale(16),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saveButtonText,
              {
                color: colors.surface,
                fontSize: getResponsiveFontSize('large'),
              },
            ]}
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1.5,
    marginBottom: moderateVerticalScale(12),
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: 0,
  },
  languageItemLabel: {
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
});

