/**
 * BalanceCard Component
 * Card utama dengan balance, title, dan action buttons - Optimized
 */
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeSlash } from 'iconsax-react-nativejs';
import { useNavigation } from '@react-navigation/native';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getIconSize,
  getResponsiveFontSize,
  FontFamily,
} from '../../../core/config';
import { useTheme } from '../../../core/theme';
import { useTranslation } from '../../../core/i18n';
import { WithdrawIcon } from './WithdrawIcon';
import { TopUpIcon } from './TopUpIcon';

interface BalanceCardProps {
  title: string;
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

// Pre-calculate icon sizes
const ICON_SIZE_MEDIUM = getIconSize('medium');
const ICON_SIZE_SMALL = scale(20);

// Pre-create Eye icons to avoid re-creation
const EYE_ICON = <Eye size={ICON_SIZE_MEDIUM} color="#FFFFFF" variant="Outline" />;
const EYE_SLASH_ICON = <EyeSlash size={ICON_SIZE_MEDIUM} color="#FFFFFF" variant="Outline" />;

// Custom comparison untuk mencegah re-render yang tidak perlu
const areEqual = (prevProps: BalanceCardProps, nextProps: BalanceCardProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.balance === nextProps.balance &&
    prevProps.showBalance === nextProps.showBalance &&
    prevProps.onToggleBalance === nextProps.onToggleBalance
  );
};

export const BalanceCard: React.FC<BalanceCardProps> = React.memo(({
  title,
  balance,
  showBalance,
  onToggleBalance,
}) => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Memoized handlers
  const handleWithdraw = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Withdraw');
  }, [navigation]);

  const handleTopUp = useCallback(() => {
    // @ts-ignore
    navigation.navigate('TopUp');
  }, [navigation]);

  // Memoized formatted balance
  const formattedBalance = useMemo(() => {
    return showBalance
      ? `Rp ${balance.toLocaleString('id-ID')}`
      : 'Rp ********';
  }, [balance, showBalance]);

  // Memoized gradient styles
  const gradientBaseStyle = useMemo(() => [
    styles.gradientBase,
    { backgroundColor: isDark ? '#0A0A0F' : '#1E1B4B' }
  ], [isDark]);

  const gradientOverlay1Style = useMemo(() => [
    styles.gradientOverlay1,
    {
      backgroundColor: isDark
        ? 'rgba(236, 72, 153, 0.3)'
        : 'rgba(236, 72, 153, 0.2)',
    }
  ], [isDark]);

  const gradientOverlay2Style = useMemo(() => [
    styles.gradientOverlay2,
    {
      backgroundColor: isDark
        ? 'rgba(251, 191, 36, 0.2)'
        : 'rgba(251, 191, 36, 0.15)',
    }
  ], [isDark]);

  // Memoized text styles
  const balanceLabelStyle = useMemo(() => [
    styles.balanceLabel,
    { color: '#FFFFFF', opacity: 0.9 }
  ], []);

  const balanceAmountStyle = useMemo(() => [
    styles.balanceAmount,
    { color: '#FFFFFF' }
  ], []);

  const actionLabelStyle = useMemo(() => [
    styles.balanceActionLabel,
    { color: '#FFFFFF' }
  ], []);

  return (
    <View style={styles.mainCard}>
      <View style={styles.mainCardGradient}>
        {/* Gradient Background Layers */}
        <View style={gradientBaseStyle} />
        <View style={gradientOverlay1Style} />
        <View style={gradientOverlay2Style} />

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceLeft}>
              <Text style={balanceLabelStyle}>
                {t('home.balance')}
              </Text>
              <View style={styles.balanceRow}>
                <Text style={balanceAmountStyle}>
                  {formattedBalance}
                </Text>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={onToggleBalance}
                >
                  {showBalance ? EYE_ICON : EYE_SLASH_ICON}
                </TouchableOpacity>
              </View>
            </View>
            {/* Action Buttons */}
            <View style={styles.balanceActionButtons}>
              <TouchableOpacity
                style={styles.balanceActionButton}
                onPress={handleWithdraw}
              >
                <WithdrawIcon
                  width={ICON_SIZE_SMALL}
                  height={ICON_SIZE_SMALL}
                  color="#FFFFFF"
                />
                <Text style={actionLabelStyle}>
                  {t('home.withdrawal')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.balanceActionButton}
                onPress={handleTopUp}
              >
                <TopUpIcon
                  width={ICON_SIZE_SMALL}
                  height={ICON_SIZE_SMALL}
                  color="#FFFFFF"
                />
                <Text style={actionLabelStyle}>
                  {t('home.topUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}, areEqual);

BalanceCard.displayName = 'BalanceCard';

const styles = StyleSheet.create({
  mainCard: {
    position: 'relative',
    zIndex: 1,
  },
  mainCardGradient: {
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 6,
    position: 'relative',
    zIndex: 2,
    minHeight: scale(90),
    overflow: 'hidden',
  },
  gradientBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(16),
  },
  gradientOverlay1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '100%',
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
  },
  gradientOverlay2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
  },
  cardContent: {
    padding: scale(16),
    zIndex: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  balanceActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  balanceActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(70),
    height: scale(70),
  },
  balanceActionLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  balanceLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  balanceAmount: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  eyeButton: {
    minWidth: scale(44),
    minHeight: scale(44),
    justifyContent: 'center',
  },
});

