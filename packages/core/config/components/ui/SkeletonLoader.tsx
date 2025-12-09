/**
 * SkeletonLoader Component
 * Reusable skeleton loader dengan shimmer effect untuk loading states
 * Menggunakan react-native-skeleton-placeholder
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../../theme';
import { scale, moderateScale, moderateVerticalScale, getResponsiveFontSize } from '../../utils/responsive';

interface SkeletonLoaderProps {
  /**
   * Width dari skeleton (default: '100%')
   */
  width?: number | string;
  /**
   * Height dari skeleton (default: 20)
   */
  height?: number;
  /**
   * Border radius (default: 4)
   */
  borderRadius?: number;
  /**
   * Custom style
   */
  style?: ViewStyle;
  /**
   * Children untuk custom skeleton layout
   */
  children?: React.ReactNode;
}

/**
 * Base Skeleton Component
 * Wrapper untuk SkeletonPlaceholder dengan theme integration
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = scale(20),
  borderRadius = scale(4),
  style,
  children,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={colors.surfaceSecondary}
      highlightColor={colors.surface}
      speed={1200}
      direction="right"
    >
      {children || (
        <View style={[styles.defaultSkeleton, { width: width as number, height, borderRadius }, style]} />
      )}
    </SkeletonPlaceholder>
  );
};

/**
 * Skeleton untuk Balance Card
 */
export const BalanceCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={colors.surfaceSecondary}
      highlightColor={colors.surface}
      speed={1200}
      direction="right"
    >
      <View style={styles.balanceCardContainer}>
        <View style={styles.balanceCardGradient}>
          <View style={styles.balanceCardContent}>
            <View style={styles.balanceCardLeft}>
              <View style={styles.balanceLabelSkeleton} />
              <View style={styles.balanceRowSkeleton}>
                <View style={styles.balanceAmountSkeleton} />
                <View style={styles.eyeButtonSkeleton} />
              </View>
            </View>
            <View style={styles.balanceCardActions}>
              <View style={styles.balanceActionSkeleton} />
              <View style={styles.balanceActionSkeleton} />
            </View>
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

/**
 * Skeleton untuk Transaction Item
 */
export const TransactionItemSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={colors.surfaceSecondary}
      highlightColor={colors.surface}
      speed={1200}
      direction="right"
    >
      <View style={styles.transactionItemContainer}>
        <View style={styles.transactionIconSkeleton} />
        <View style={styles.transactionContentSkeleton}>
          <View style={styles.transactionHeaderSkeleton}>
            <View style={styles.transactionTitleSkeleton} />
            <View style={styles.transactionAmountSkeleton} />
          </View>
          <View style={styles.transactionDateSkeleton} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

/**
 * Skeleton untuk News Item
 */
export const NewsItemSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={colors.surfaceSecondary}
      highlightColor={colors.surface}
      speed={2000}
      direction="right"
    >
      <View style={[styles.newsItemContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.newsImageSkeleton} />
        <View style={styles.newsContentSkeleton}>
          <View style={styles.newsTitleSkeleton} />
          <View style={styles.newsDescriptionSkeleton} />
          <View style={styles.newsDescriptionSkeleton2} />
          <View style={styles.newsDateSkeleton} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

/**
 * Skeleton untuk Quick Access Button
 */
export const QuickAccessButtonSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={colors.surfaceSecondary}
      highlightColor={colors.surface}
      speed={1200}
      direction="right"
    >
      <View style={styles.quickAccessButtonContainer}>
        <View style={styles.quickAccessIconSkeleton} />
        <View style={styles.quickAccessLabelSkeleton} />
      </View>
    </SkeletonPlaceholder>
  );
};

/**
 * Skeleton untuk Notification Item
 */
export const NotificationItemSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={{ width: '100%' }}>
      <SkeletonPlaceholder
        backgroundColor={colors.surfaceSecondary}
        highlightColor={colors.surface}
        speed={1200}
        direction="right"
      >
        <View style={styles.notificationItemContainer}>
          <View style={styles.notificationIconSkeleton} />
          <View style={styles.notificationContentSkeleton}>
            <View style={styles.notificationTitleSkeleton} />
            <View style={styles.notificationMessageSkeleton} />
            <View style={styles.notificationDateSkeleton} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultSkeleton: {
    // Default skeleton style
  },
  // Balance Card Skeleton
  balanceCardContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  balanceCardGradient: {
    borderRadius: scale(16),
    minHeight: scale(90),
    overflow: 'hidden',
  },
  balanceCardContent: {
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCardLeft: {
    flex: 1,
  },
  balanceLabelSkeleton: {
    width: scale(60),
    height: scale(14),
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(8),
  },
  balanceRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  balanceAmountSkeleton: {
    width: scale(150),
    height: scale(24),
    borderRadius: scale(4),
  },
  eyeButtonSkeleton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
  },
  balanceCardActions: {
    flexDirection: 'row',
    gap: scale(8),
  },
  balanceActionSkeleton: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(8),
  },
  // Transaction Item Skeleton
  transactionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(10),
    paddingHorizontal: scale(12),
    borderRadius: scale(12),
    marginBottom: moderateVerticalScale(12),
  },
  transactionIconSkeleton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  transactionContentSkeleton: {
    flex: 1,
  },
  transactionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(4),
  },
  transactionTitleSkeleton: {
    width: '60%',
    height: scale(16),
    borderRadius: scale(4),
  },
  transactionAmountSkeleton: {
    width: scale(100),
    height: scale(16),
    borderRadius: scale(4),
  },
  transactionDateSkeleton: {
    width: scale(120),
    height: scale(12),
    borderRadius: scale(4),
  },
  // News Item Skeleton
  newsItemContainer: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  newsImageSkeleton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  newsContentSkeleton: {
    flex: 1,
  },
  newsTitleSkeleton: {
    width: '80%',
    height: getResponsiveFontSize('medium') * 1.2, // Sesuai dengan fontSize title
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  newsDescriptionSkeleton: {
    width: '100%',
    height: getResponsiveFontSize('small') * 1.2, // Sesuai dengan fontSize description
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(2),
  },
  newsDescriptionSkeleton2: {
    width: '90%',
    height: getResponsiveFontSize('small') * 1.2, // Sesuai dengan fontSize description
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  newsDateSkeleton: {
    width: scale(120),
    height: getResponsiveFontSize('small') * 1.2, // Sesuai dengan fontSize date
    borderRadius: scale(4),
  },
  // Quick Access Button Skeleton
  quickAccessButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
  },
  quickAccessIconSkeleton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginBottom: moderateVerticalScale(8),
  },
  quickAccessLabelSkeleton: {
    width: scale(60),
    height: scale(12),
    borderRadius: scale(4),
  },
  // Notification Item Skeleton
  notificationItemContainer: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: scale(14),
    marginBottom: moderateVerticalScale(8),
    alignItems: 'flex-start',
    gap: scale(12),
  },
  notificationIconSkeleton: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
  },
  notificationContentSkeleton: {
    flex: 1,
  },
  notificationTitleSkeleton: {
    width: '70%',
    height: scale(18),
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(6),
  },
  notificationMessageSkeleton: {
    width: '100%',
    height: scale(14),
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(2),
  },
  notificationDateSkeleton: {
    width: scale(180),
    height: scale(12),
    borderRadius: scale(4),
    marginTop: moderateVerticalScale(10),
  },
});

