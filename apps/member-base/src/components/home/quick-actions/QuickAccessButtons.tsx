/**
 * QuickAccessButtons Component
 * Row dengan quick access buttons - Optimized for performance
 * Menggunakan menu dari quick menu settings
 */
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ArrowDown2,
  Call,
  People,
  Game,
  ArrowUp2,
  Shop,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getIconSize,
  getResponsiveFontSize,
  getTabletGap,
  getHorizontalPadding,
  FontFamily,
  useQuickMenu,
  useDimensions,
  QuickAccessButtonSkeleton,
  QuickMenuItem,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface QuickAccessButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onPress?: () => void;
}

interface QuickAccessButtonsProps {
  buttons?: QuickAccessButton[];
  /**
   * Gap antar button untuk tablet landscape (optional)
   * Jika tidak diatur, akan menggunakan gap default
   */
  tabletLandscapeGap?: number;
  /**
   * Gap antar button untuk tablet portrait (optional)
   * Jika tidak diatur, akan menggunakan gap default
   */
  tabletPortraitGap?: number;
}

// Pre-calculate icon size once
const ICON_SIZE = getIconSize('large');

// Pre-create all icon instances to avoid re-creating on every render
const ICON_INSTANCES = {
  payIPL: <ArrowDown2 size={ICON_SIZE} color="#3B82F6" variant="Bold" />,
  emergency: <Call size={ICON_SIZE} color="#F59E0B" variant="Bold" />,
  guest: <People size={ICON_SIZE} color="#10B981" variant="Bold" />,
  ppob: <Game size={ICON_SIZE} color="#8B5CF6" variant="Bold" />,
  transfer: <ArrowDown2 size={ICON_SIZE} color="#EF4444" variant="Bold" />,
  payment: <Game size={ICON_SIZE} color="#6366F1" variant="Bold" />,
  bill: <Game size={ICON_SIZE} color="#EC4899" variant="Bold" />,
  topup: <ArrowUp2 size={ICON_SIZE} color="#22C55E" variant="Bold" />,
  donation: <People size={ICON_SIZE} color="#F59E0B" variant="Bold" />,
  marketplace: <Shop size={ICON_SIZE} color="#06B6D4" variant="Bold" />,
  default: <Game size={ICON_SIZE} color="#8B5CF6" variant="Bold" />,
} as const;

// Icon mapping untuk setiap menu - returns pre-created icon
const getMenuIcon = (iconName?: string): React.ReactNode => {
  if (!iconName || !(iconName in ICON_INSTANCES)) {
    return ICON_INSTANCES.default;
  }
  return ICON_INSTANCES[iconName as keyof typeof ICON_INSTANCES];
};

// Default background colors untuk setiap menu
const getDefaultBgColor = (iconName?: string): string => {
  switch (iconName) {
    case 'payIPL':
      return '#DBEAFE';
    case 'emergency':
      return '#FEF3C7';
    case 'guest':
      return '#D1FAE5';
    case 'ppob':
      return '#E9D5FF';
    case 'transfer':
      return '#FEE2E2';
    case 'payment':
      return '#E0E7FF';
    case 'bill':
      return '#FCE7F3';
    case 'topup':
      return '#DCFCE7';
    case 'donation':
      return '#FEF3C7';
    case 'marketplace':
      return '#E0F2FE';
    default:
      return '#E5E7EB';
  }
};

// Default fallback buttons - empty array
const DEFAULT_BUTTONS: QuickAccessButton[] = [];

// Skeleton component for loading state
const QuickAccessSkeleton = React.memo(() => {
  const skeletonItems = useMemo(() => Array.from({ length: 4 }), []);
  const gap = useMemo(() => scale(12), []);
  const { width: screenWidth } = useDimensions();

  // Re-calculate buttonWidth for skeleton
  const horizontalPadding = getHorizontalPadding();
  const itemsPerRow = 4;
  const buttonWidth = useMemo(() => {
    const totalGap = gap * (itemsPerRow - 1);
    const availableWidth = screenWidth - (horizontalPadding * 2);
    return Math.floor((availableWidth - totalGap) / itemsPerRow);
  }, [screenWidth, horizontalPadding, gap, itemsPerRow]);

  return (
    <View style={styles.aksesCepatRow}>
      {skeletonItems.map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            {
              width: buttonWidth,
              marginRight: (index + 1) % itemsPerRow === 0 ? 0 : gap,
              marginBottom: moderateVerticalScale(12),
            },
          ]}
        >
          <QuickAccessButtonSkeleton />
        </View>
      ))}
    </View>
  );
});

QuickAccessSkeleton.displayName = 'QuickAccessSkeleton';

// Custom comparison untuk mencegah re-render yang tidak perlu
const areEqualQuickAccess = (
  prevProps: QuickAccessButtonsProps,
  nextProps: QuickAccessButtonsProps
) => {
  // Jika buttons prop diberikan, compare buttons
  if (prevProps.buttons && nextProps.buttons) {
    if (prevProps.buttons.length !== nextProps.buttons.length) {
      return false;
    }
    return prevProps.buttons.every(
      (btn, index) => btn.id === nextProps.buttons![index].id
    );
  }
  // Jika buttons tidak diberikan, component akan menggunakan internal state
  // yang sudah di-handle oleh useQuickMenu, jadi return true untuk skip re-render
  return prevProps.buttons === nextProps.buttons;
};

export const QuickAccessButtons: React.FC<QuickAccessButtonsProps> = React.memo(({
  buttons,
  tabletLandscapeGap,
  tabletPortraitGap,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { enabledItems, isLoading, refresh } = useQuickMenu();
  const { width: screenWidth } = useDimensions();
  
  // Refresh menu ketika screen di-focus (misalnya setelah kembali dari settings)
  // Tapi hanya refresh jika sudah pernah load sebelumnya (untuk mencegah flicker saat initial load)
  const hasLoadedRef = React.useRef(false);
  const refreshTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useFocusEffect(
    React.useCallback(() => {
      // Set flag bahwa sudah pernah load
      if (!isLoading) {
        hasLoadedRef.current = true;
      }
      
      // Hanya refresh jika sudah pernah load sebelumnya dan tidak sedang loading
      // Delay sedikit untuk mencegah flicker
      if (hasLoadedRef.current && !isLoading) {
        // Clear previous timeout jika ada
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        
        // Delay refresh sedikit untuk mencegah flicker saat transisi
        refreshTimeoutRef.current = setTimeout(() => {
          refresh();
        }, 100);
      }
      
      // Cleanup timeout saat unmount atau focus out
      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }, [refresh, isLoading])
  );
  
  // Stabilize screenWidth dengan rounding untuk mencegah re-render kecil
  const stableScreenWidth = useMemo(() => {
    // Round ke 10 terdekat untuk mencegah re-render karena perubahan kecil
    return Math.round(screenWidth / 10) * 10;
  }, [screenWidth]);
  
  // Get gap yang sesuai dengan device dan orientation
  const gap = useMemo(() => scale(12), []);
  
  // Stabilize enabledItems dengan useRef untuk mencegah re-render
  const previousEnabledItemsRef = React.useRef<typeof enabledItems>(enabledItems);
  const previousEnabledItemsKeyRef = React.useRef<string>('');
  
  const stableEnabledItems = useMemo(() => {
    const currentKey = JSON.stringify(enabledItems.map(item => ({ 
      id: item.id, 
      enabled: item.enabled,
      icon: item.icon,
      iconBgColor: item.iconBgColor 
    })));
    
    // Jika sama dengan previous, return previous array (reference yang sama)
    if (currentKey === previousEnabledItemsKeyRef.current) {
      return previousEnabledItemsRef.current;
    }
    
    // Update refs
    previousEnabledItemsKeyRef.current = currentKey;
    previousEnabledItemsRef.current = enabledItems;
    return enabledItems;
  }, [enabledItems]);
  
  // Memoized menu label getter - tidak depend pada t() untuk mencegah re-render
  const menuLabelMap = useMemo(() => {
    const menuIdToTranslationKey: Record<string, string> = {};
    return menuIdToTranslationKey;
  }, []);
  
  const getMenuLabel = useCallback((menuId: string, fallbackLabel: string): string => {
    const translationKey = menuLabelMap[menuId];
    return translationKey ? t(translationKey) : fallbackLabel;
  }, [t, menuLabelMap]);

  // Convert enabled menu items ke format QuickAccessButton
  // Hanya recalculate jika enabledItems benar-benar berubah
  const previousMenuButtonsRef = React.useRef<QuickAccessButton[]>([]);
  const menuButtons = useMemo((): QuickAccessButton[] => {
    // Jika masih loading, jangan render apa-apa dulu, biarkan skeleton yang tampil
    if (isLoading) {
      return [];
    }
    const items = stableEnabledItems.length > 0 ? stableEnabledItems : DEFAULT_BUTTONS;
    const buttons: QuickAccessButton[] = items.map((item) => ({
      id: item.id,
      label: getMenuLabel(item.id, item.label),
      icon: getMenuIcon(item.icon as string),
      iconBgColor: item.iconBgColor || getDefaultBgColor(item.icon as string),
      onPress: (item as unknown as QuickMenuItem).route
        ? () => {
            // @ts-ignore - navigation type akan di-setup nanti
            navigation.navigate((item as unknown as QuickMenuItem).route as never);
          }
        : undefined,
    }));
    
    // Compare dengan previous untuk mencegah re-render jika sama
    const currentKey = JSON.stringify(buttons.map((b: QuickAccessButton) => ({ id: b.id, label: b.label })));
    const previousKey = JSON.stringify(previousMenuButtonsRef.current.map((b: QuickAccessButton) => ({ id: b.id, label: b.label })));
    
    if (currentKey === previousKey && previousMenuButtonsRef.current.length > 0) {
      return previousMenuButtonsRef.current;
    }
    
    previousMenuButtonsRef.current = buttons;
    return buttons;
  }, [stableEnabledItems, getMenuLabel, isLoading, navigation]);

  const buttonsToRender = buttons || menuButtons;
  const buttonCount = buttonsToRender.length;
  const itemsPerRow = 4;

  // Hitung width button untuk 4 per row dengan gap
  const horizontalPadding = getHorizontalPadding();
  const buttonWidth = useMemo(() => {
    const totalGap = gap * (itemsPerRow - 1);
    const availableWidth = stableScreenWidth - (horizontalPadding * 2);
    return Math.floor((availableWidth - totalGap) / itemsPerRow);
  }, [stableScreenWidth, horizontalPadding, gap, itemsPerRow]);

  // Memoized button style calculator
  const getButtonStyle = useCallback((index: number) => {
    const rowIndex = Math.floor(index / itemsPerRow);
    const positionInRow = index % itemsPerRow;
    const isLastInRow = positionInRow === itemsPerRow - 1;
    const totalRows = Math.ceil(buttonCount / itemsPerRow);
    const isLastRow = rowIndex === totalRows - 1;

    return {
      width: buttonWidth,
      marginRight: isLastInRow ? 0 : gap,
      marginBottom: isLastRow ? 0 : moderateVerticalScale(12),
    };
  }, [buttonWidth, gap, buttonCount]);

  if (isLoading) {
    return <QuickAccessSkeleton />;
  }

  return (
    <View style={styles.aksesCepatRow}>
      {buttonsToRender.map((button, index) => (
        <TouchableOpacity
          key={button.id}
          style={[
            styles.aksesCepatButton,
            getButtonStyle(index),
          ]}
          onPress={button.onPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.aksesCepatIcon,
              { backgroundColor: button.iconBgColor },
            ]}
          >
            {button.icon}
          </View>
          <Text
            style={[
              styles.aksesCepatLabel,
              { color: colors.text },
            ]}
            numberOfLines={2}
          >
            {button.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}, areEqualQuickAccess);

QuickAccessButtons.displayName = 'QuickAccessButtons';

const styles = StyleSheet.create({
  aksesCepatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  aksesCepatButton: {
    alignItems: 'center',
  },
  aksesCepatIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  aksesCepatLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
});


