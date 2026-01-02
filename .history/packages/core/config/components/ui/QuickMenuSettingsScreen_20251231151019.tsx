/**
 * QuickMenuSettingsScreen Component
 * Screen untuk mengatur menu cepat yang ditampilkan di home
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
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
  DocumentText,
} from 'iconsax-react-nativejs';
// Import QuickAccessButtons via wrapper (temporary solution for dependency violation)
// TODO: Move QuickAccessButtons to core or refactor in future phase
import { getIconSize } from '@core/config';
import { QuickAccessButtons } from './QuickAccessButtonsWrapper';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
  ScreenHeader,
  BottomSheet,
  loadQuickMenuSettings,
  saveQuickMenuSettings,
  getAllMenuItems,
  type QuickMenuItem,
} from '@core/config';

// Stable snapPoints array - defined outside component to prevent re-creation
const PREVIEW_SNAP_POINTS = [125];

// Memoized Preview Content to prevent unnecessary re-renders
const PreviewContent = memo<{
  previewButtons: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    iconBgColor: string;
  }>;
  headerContainerStyle: any;
  titleStyle: any;
  previewTitleText: string;
  scrollContentStyle: any;
  cardContainerStyle: any;
  topIndicatorStyle: any;
  placeholderSmallStyle: any;
  placeholderLargeStyle: any;
}>(({
  previewButtons,
  headerContainerStyle,
  titleStyle,
  previewTitleText,
  scrollContentStyle,
  cardContainerStyle,
  topIndicatorStyle,
  placeholderSmallStyle,
  placeholderLargeStyle,
}) => {
  return (
    <>
      <View style={headerContainerStyle}>
        <Text style={titleStyle}>
          {previewTitleText}
        </Text>
      </View>
      <ScrollView
        style={styles.previewScrollView}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Container with Top Indicator (ThemeSettings pattern) */}
        <View style={cardContainerStyle}>
          {/* Top Blue Indicator */}
          <View style={topIndicatorStyle} />

          {/* Placeholder sections (ThemeSettings pattern) */}
          <View style={placeholderSmallStyle} />
          <View style={placeholderLargeStyle} />

          {/* Quick Access Preview */}
          <View style={styles.previewQuickAccess}>
            <QuickAccessButtons buttons={previewButtons} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders
  // Only re-render if previewButtons actually changed
  if (prevProps.previewButtons.length !== nextProps.previewButtons.length) {
    return false; // Re-render if length changed
  }
  
  // Check if any button changed
  for (let i = 0; i < prevProps.previewButtons.length; i++) {
    if (prevProps.previewButtons[i].id !== nextProps.previewButtons[i].id) {
      return false; // Re-render if button changed
    }
  }
  
  // Check other props
  if (
    prevProps.previewTitleText !== nextProps.previewTitleText ||
    prevProps.headerContainerStyle !== nextProps.headerContainerStyle ||
    prevProps.titleStyle !== nextProps.titleStyle ||
    prevProps.scrollContentStyle !== nextProps.scrollContentStyle ||
    prevProps.cardContainerStyle !== nextProps.cardContainerStyle ||
    prevProps.topIndicatorStyle !== nextProps.topIndicatorStyle ||
    prevProps.placeholderSmallStyle !== nextProps.placeholderSmallStyle ||
    prevProps.placeholderLargeStyle !== nextProps.placeholderLargeStyle
  ) {
    return false; // Re-render if any style changed
  }
  
  return true; // Don't re-render - props are the same
});

PreviewContent.displayName = 'PreviewContent';

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
        // Load only from storage, not from plugin routes (to avoid dummy menu)
        const storedItems = await loadQuickMenuSettings();
        
        // If no items in storage, create dummy menu for testing
        if (storedItems.length === 0) {
          const dummyMenuItems: QuickMenuItem[] = [
            {
              id: 'payIPL',
              label: 'Bayar IPL',
              enabled: true,
              icon: 'payIPL',
              route: 'payIPL',
            },
            {
              id: 'emergency',
              label: 'Emergency',
              enabled: false,
              icon: 'emergency',
              route: 'emergency',
            },
            {
              id: 'guest',
              label: 'Tamu',
              enabled: true,
              icon: 'guest',
              route: 'guest',
            },
            {
              id: 'ppob',
              label: 'PPOB',
              enabled: false,
              icon: 'ppob',
              route: 'ppob',
            },
            {
              id: 'transfer',
              label: 'Transfer',
              enabled: true,
              icon: 'transfer',
              route: 'transfer',
            },
            {
              id: 'topup',
              label: 'Top Up',
              enabled: false,
              icon: 'topup',
              route: 'topup',
            },
          ];
          setMenuItems(dummyMenuItems);
        } else {
          setMenuItems(storedItems);
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

  // Icon cache to prevent re-creation of React elements
  const iconCacheRef = React.useRef<Map<string, React.ReactNode>>(new Map());
  
  // Icon mapping function - memoized with useCallback and icon cache
  const getMenuIcon = useCallback((iconName?: string) => {
    const cacheKey = `${iconName || 'default'}-${colors.info}-${colors.warning}-${colors.success}-${colors.error}`;
    
    // Check cache first
    if (iconCacheRef.current.has(cacheKey)) {
      return iconCacheRef.current.get(cacheKey)!;
    }
    
    // Create new icon
    const iconSize = getIconSize('large');
    let icon: React.ReactNode;
    
    switch (iconName) {
      case 'payIPL':
        icon = <ArrowDown2 size={iconSize} color={colors.info} variant="Bold" />;
        break;
      case 'emergency':
        icon = <Call size={iconSize} color={colors.warning} variant="Bold" />;
        break;
      case 'guest':
        icon = <People size={iconSize} color={colors.success} variant="Bold" />;
        break;
      case 'ppob':
        icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
        break;
      case 'transfer':
        icon = <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
        break;
      case 'payment':
        icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
        break;
      case 'bill':
        icon = <Game size={iconSize} color={colors.error} variant="Bold" />;
        break;
      case 'topup':
        icon = <ArrowUp2 size={iconSize} color={colors.success} variant="Bold" />;
        break;
      case 'donation':
        icon = <People size={iconSize} color={colors.warning} variant="Bold" />;
        break;
      case 'marketplace':
        icon = <Shop size={iconSize} color={colors.info} variant="Bold" />;
        break;
      default:
        icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
    }
    
    // Cache the icon
    iconCacheRef.current.set(cacheKey, icon);
    return icon;
  }, [colors.info, colors.warning, colors.success, colors.error]);

  // Get default background color - memoized with useCallback
  const getDefaultBgColor = useCallback((iconName?: string): string => {
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
  }, [colors.infoLight, colors.warningLight, colors.successLight, colors.errorLight, colors.borderLight, colors.surfaceSecondary, colors.surface]);

  // Convert menuItems to QuickAccessButton format for preview
  // Use string serialization for stable comparison
  const menuItemsKey = useMemo(
    () => menuItems.map(item => `${item.id}:${item.enabled ? '1' : '0'}`).join(','),
    [menuItems]
  );

  // Stable empty array reference
  const emptyButtonsArray = useMemo(() => [], []);

  const previewButtons = useMemo(() => {
    const enabledItems = menuItems.filter(item => item.enabled);
    
    // Return stable empty array if no enabled items
    if (enabledItems.length === 0) {
      return emptyButtonsArray;
    }
    
    return enabledItems.map((item) => ({
      id: item.id,
      label: item.label,
      icon: getMenuIcon(item.icon),
      iconBgColor: item.iconBgColor || getDefaultBgColor(item.icon),
    }));
  }, [menuItemsKey, menuItems, getMenuIcon, getDefaultBgColor, emptyButtonsArray]);

  // Check if there are any enabled menu items
  const hasEnabledItems = useMemo(() => {
    return menuItems.some(item => item.enabled);
  }, [menuItems]);

  // Auto-close preview if no enabled items
  useEffect(() => {
    if (showPreview && !hasEnabledItems) {
      setShowPreview(false);
    }
  }, [showPreview, hasEnabledItems]);

  // Memoize BottomSheet callbacks to prevent flickering
  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  // Memoize snapPoints to prevent re-creation - use stable reference
  const previewSnapPoints = useMemo(() => [125], []);

  // Memoize all style objects to prevent re-creation on every render
  const headerContainerStyle = useMemo(
    () => [
      styles.previewHeaderContainer,
      {
        paddingHorizontal: getHorizontalPadding(),
        borderBottomColor: colors.border,
      },
    ],
    [colors.border]
  );

  const titleStyle = useMemo(
    () => [
      styles.previewTitle,
      {
        color: colors.text,
        fontSize: getResponsiveFontSize('large'),
      },
    ],
    [colors.text]
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.previewContent,
      { paddingHorizontal: getHorizontalPadding() },
    ],
    []
  );

  const cardContainerStyle = useMemo(
    () => [
      styles.previewCardContainer,
      {
        backgroundColor: colors.surfaceSecondary || '#F3F4F6',
      },
    ],
    [colors.surfaceSecondary]
  );

  const topIndicatorStyle = useMemo(
    () => [
      styles.previewTopIndicator,
      {
        backgroundColor: colors.primary,
      },
    ],
    [colors.primary]
  );

  const placeholderSmallStyle = useMemo(
    () => [
      styles.previewPlaceholderSmall,
      {
        backgroundColor: colors.surface || '#FFFFFF',
        opacity: 0.6,
        marginTop: moderateVerticalScale(16),
        marginBottom: moderateVerticalScale(12),
      },
    ],
    [colors.surface]
  );

  const placeholderLargeStyle = useMemo(
    () => [
      styles.previewPlaceholderLarge,
      {
        backgroundColor: colors.surface || '#FFFFFF',
        opacity: 0.6,
        marginBottom: moderateVerticalScale(24),
      },
    ],
    [colors.surface]
  );

  // Memoize preview title text
  const previewTitleText = useMemo(
    () => `${t('common.preview')} ${t('home.homepage')}`,
    [t]
  );

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
          (!isLoading && (menuItems.length === 0 || (!hasEnabledItems && menuItems.length > 0))) && styles.scrollContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isLoading && (menuItems.length === 0 || !hasEnabledItems) ? (
          <View style={styles.emptyStateView}>
            <View
              style={[
                styles.emptyStateIconContainer,
                { backgroundColor: colors.surfaceSecondary || colors.borderLight },
              ]}
            >
              <DocumentText
                size={getIconSize('large') * 1.5}
                color={colors.textSecondary}
                variant="Outline"
              />
            </View>
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: colors.textSecondary,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.noMenuEnabled')}
            </Text>
            {menuItems.length > 0 && (
              <Text
                style={[
                  styles.emptyStateSubtext,
                  {
                    color: colors.textTertiary,
                    fontSize: getResponsiveFontSize('small'),
                  },
                ]}
              >
                {t('profile.enableMenuToPreview')}
              </Text>
            )}
          </View>
        ) : (
          menuItems.map((item) => (
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
          ))
        )}
      </ScrollView>

      {/* Footer Buttons - Only show if has enabled items */}
      {hasEnabledItems && (
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
      )}

      {/* Preview BottomSheet - Only show if there are enabled items */}
      {hasEnabledItems && (
        <BottomSheet
          visible={showPreview}
          onClose={handleClosePreview}
          snapPoints={PREVIEW_SNAP_POINTS}
          initialSnapPoint={0}
          enablePanDownToClose={true}
        >
        <PreviewContent
          previewButtons={previewButtons}
          headerContainerStyle={headerContainerStyle}
          titleStyle={titleStyle}
          previewTitleText={previewTitleText}
          scrollContentStyle={scrollContentStyle}
          cardContainerStyle={cardContainerStyle}
          topIndicatorStyle={topIndicatorStyle}
          placeholderSmallStyle={placeholderSmallStyle}
          placeholderLargeStyle={placeholderLargeStyle}
        />
      </BottomSheet>
      )}
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
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  emptyStateView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyStateIconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
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
  emptyStateText: {
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  emptyStateSubtext: {
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
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
  previewHeaderContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewTitle: {
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'left',
  },
  previewScrollView: {
    flex: 1,
  },
  previewContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(32),
  },
  previewCardContainer: {
    borderRadius: scale(16),
    padding: scale(20),
  
  },
  previewTopIndicator: {
    width: scale(100),
    height: scale(30),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  previewPlaceholderSmall: {
    height: moderateVerticalScale(30),
    borderRadius: scale(12),
  },
  previewPlaceholderLarge: {
    height: moderateVerticalScale(100),
    borderRadius: scale(12),
  },
  previewQuickAccess: {
    marginTop: 0,
  },
});

