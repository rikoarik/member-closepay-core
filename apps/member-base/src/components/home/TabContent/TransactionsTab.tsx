/**
 * TransactionsTab Component
 * Tab content untuk transactions dengan FlatList optimization
 */
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  BalanceCardSkeleton,
  TransactionItemSkeleton,
  CustomRefreshControl,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { QuickAccessButtons } from '../quick-actions/QuickAccessButtons';
import { SectionHeader } from '../sections/SectionHeader';

interface TransactionsTabProps {
  title: string;
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBalanceDetailPress?: () => void;
  isLoading?: boolean;
  isActive?: boolean; // Add prop to know if tab is active
  isVisible?: boolean; // Add prop to know if tab is visible (for lifecycle)
  onRefreshRequested?: (refreshFn: () => void) => void; // Callback to expose refresh function to parent
}

// Separator component untuk gap antar items
const ItemSeparator = () => <View style={styles.separator} />;

export const TransactionsTab: React.FC<TransactionsTabProps> = React.memo(({
  title,
  balance,
  showBalance,
  onToggleBalance,
  refreshing = false,
  onRefresh,
  onBalanceDetailPress,
  isLoading = false,
  isActive = true,
  isVisible = true,
  onRefreshRequested,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  // Memoize translation keys untuk mencegah re-render
  const transactionHistoryTitle = useMemo(() => t('home.transactionHistory'), [t]);
  const detailLabel = useMemo(() => t('common.detail'), [t]);

  // ListHeaderComponent dengan semua content non-list
  const ListHeader = useMemo(() => (
    <>
      {/* Main Card - Balance */}


      {/* Quick Access */}
      <View style={styles.section}>
        <QuickAccessButtons />
      </View>

      {/* Transaction History Header */}
      <View style={styles.transactionHeaderSection}>
        <SectionHeader
          title={transactionHistoryTitle}
          showDetailLink={true}
          detailLabel={detailLabel}
          onDetailPress={onBalanceDetailPress}
        />
      </View>
    </>
  ), [title, balance, showBalance, onToggleBalance, transactionHistoryTitle, detailLabel, onBalanceDetailPress]);

  // Memoized content container style
  const contentContainerStyle = useMemo(
    () => [
      styles.contentContainer,
      {
        paddingBottom: insets.bottom + moderateVerticalScale(16),
        paddingHorizontal: horizontalPadding,
      },
    ],
    [insets.bottom, horizontalPadding]
  );

  const scrollPositionRef = useRef(0); // Preserve scroll position
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList to restore scroll position

  // Lifecycle: onShow - restore scroll position when tab becomes visible
  useEffect(() => {
    if (isVisible && scrollPositionRef.current > 0 && flatListRef.current) {
      // Restore scroll position after a short delay to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: scrollPositionRef.current,
          animated: false,
        });
      }, 100);
    }
  }, [isVisible]);

  // Show skeleton loader when loading

  return (
    <FlatList
      data={[]}
      renderItem={() => <View />}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      nestedScrollEnabled={true}
      scrollEnabled={isActive} // Only enable scroll when tab is active
      bounces={false} // Disable bounce untuk mencegah scroll interference
      directionalLockEnabled={true} // Lock scroll direction
      onScrollBeginDrag={(e) => {
        // Prevent parent scroll when dragging in this list
        e.stopPropagation();
      }}
    />
  );
});

TransactionsTab.displayName = 'TransactionsTab';

const styles = StyleSheet.create({
  separator: {
    height: scale(12),
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    paddingTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  transactionHeaderSection: {
    paddingTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(8),
  },
});

