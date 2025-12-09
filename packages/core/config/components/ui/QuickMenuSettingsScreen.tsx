/**
 * QuickMenuSettingsScreen Component
 * Screen untuk mengatur menu cepat yang ditampilkan di home
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowDown2,
  ArrowUp2,
  Call,
  People,
  Game,
  Shop,
  ArrowLeft2,
} from 'iconsax-react-nativejs';
// Import QuickAccessButtons via wrapper (temporary solution for dependency violation)
// TODO: Move QuickAccessButtons to core or refactor in future phase
import { getIconSize } from '@core/config';
import { QuickAccessButtons } from './QuickAccessButtonsWrapper';
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
  ScreenHeader,
  loadQuickMenuSettings,
  saveQuickMenuSettings,
  type QuickMenuItem,
} from '@core/config';

export const QuickMenuSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Initial state - empty array, will be loaded from storage
  const [menuItems, setMenuItems] = useState<QuickMenuItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Load menu settings saat component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await loadQuickMenuSettings();
        if (saved.length > 0) {
          setMenuItems(saved);
        }
      } catch (error) {
        console.error('Failed to load quick menu settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveQuickMenuSettings(menuItems);
      // @ts-ignore - navigation type akan di-setup nanti
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save quick menu settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert menuItems to QuickAccessButton format for preview
  const previewButtons = useMemo(() => {
    const enabledItems = menuItems.filter(item => item.enabled);
    
    // Icon mapping function (same as in QuickAccessButtons)
    const getMenuIcon = (iconName?: string) => {
      const iconSize = getIconSize('large');
      switch (iconName) {
        case 'payIPL':
          return <ArrowDown2 size={iconSize} color={colors.info} variant="Bold" />;
        case 'emergency':
          return <Call size={iconSize} color={colors.warning} variant="Bold" />;
        case 'guest':
          return <People size={iconSize} color={colors.success} variant="Bold" />;
        case 'ppob':
          return <Game size={iconSize} color={colors.info} variant="Bold" />;
        case 'transfer':
          return <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
        case 'payment':
          return <Game size={iconSize} color={colors.info} variant="Bold" />;
        case 'bill':
          return <Game size={iconSize} color={colors.error} variant="Bold" />;
        case 'topup':
          return <ArrowUp2 size={iconSize} color={colors.success} variant="Bold" />;
        case 'donation':
          return <People size={iconSize} color={colors.warning} variant="Bold" />;
        case 'marketplace':
          return <Shop size={iconSize} color={colors.info} variant="Bold" />;
        default:
          return <Game size={iconSize} color={colors.info} variant="Bold" />;
      }
    };

    // Get default background color
    const getDefaultBgColor = (iconName?: string): string => {
      switch (iconName) {
        case 'payIPL': return colors.infoLight;
        case 'emergency': return colors.warningLight;
        case 'guest': return colors.successLight;
        case 'ppob': return colors.infoLight;
        case 'transfer': return colors.errorLight;
        case 'payment': return colors.infoLight;
        case 'bill': return colors.errorLight;
        case 'topup': return colors.successLight;
        case 'donation': return colors.warningLight;
        case 'marketplace': return colors.infoLight;
        default: return colors.borderLight || colors.surfaceSecondary || colors.surface;
      }
    };

    return enabledItems.map((item) => ({
      id: item.id,
      label: item.label,
      icon: getMenuIcon(item.icon),
      iconBgColor: item.iconBgColor || getDefaultBgColor(item.icon),
    }));
  }, [menuItems]);

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
      <ScreenHeader title={t('profile.quickMenu')} />

      {/* Menu List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: getHorizontalPadding() },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                minHeight: getMinTouchTarget(),
              },
            ]}
          >
            <Text
              style={[
                styles.menuItemLabel,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {item.label}
            </Text>
            <Switch
              value={item.enabled}
              onValueChange={() => handleToggle(item.id)}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={item.enabled ? colors.surface : colors.textTertiary}
              ios_backgroundColor={colors.border}
            />
          </View>
        ))}
      </ScrollView>

      {/* Footer Buttons */}
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
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[
              styles.previewButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                minHeight: getMinTouchTarget(),
              },
            ]}
            onPress={() => setShowPreview(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.previewButtonText,
                {
                  color: colors.primary,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('common.preview')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                minHeight: getMinTouchTarget(),
                flex: 1,
                marginLeft: scale(12),
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
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {isSaving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView
          style={[
            styles.previewContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Preview Header */}
          <View
            style={[
              styles.previewHeader,
              {
                backgroundColor: colors.background,
                paddingHorizontal: getHorizontalPadding(),
                paddingBottom: moderateVerticalScale(16),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowPreview(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
            </TouchableOpacity>
            <Text
              style={[
                styles.previewTitle,
                {
                  color: colors.text,
                  fontSize: moderateScale(20),
                },
              ]}
            >
              {t('common.preview')} {t('home.homepage')}
            </Text>
            <View style={{ width: getIconSize('medium') }} />
          </View>

          {/* Preview Content */}
          <ScrollView
            style={styles.previewScrollView}
            contentContainerStyle={[
              styles.previewContent,
              { paddingHorizontal: getHorizontalPadding() },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance Card Placeholder */}
            <View
              style={[
                styles.previewBalanceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.previewBalanceBar,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View style={styles.previewBalanceContent}>
                <View
                  style={[
                    styles.previewBalancePlaceholder,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
            </View>

            {/* Quick Access Preview */}
            <View style={styles.previewQuickAccess}>
              <QuickAccessButtons buttons={previewButtons} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  menuItemLabel: {
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
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
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  previewScrollView: {
    flex: 1,
  },
  previewContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(32),
  },
  previewBalanceCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
    overflow: 'hidden',
    minHeight: scale(90),
  },
  previewBalanceBar: {
    height: scale(4),
    width: '30%',
  },
  previewBalanceContent: {
    padding: scale(16),
  },
  previewBalancePlaceholder: {
    height: scale(40),
    borderRadius: scale(8),
  },
  previewQuickAccess: {
    marginTop: moderateVerticalScale(8),
  },
});

