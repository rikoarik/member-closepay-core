/**
 * Withdraw Success Screen
 * Screen untuk menampilkan hasil sukses penarikan dana
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';

interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  maskedAccount: string;
  isActive: boolean;
}

interface RouteParams {
  amount: number;
  fee: number;
  total: number;
  account: BankAccount;
}

export const WithdrawSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;

  const { amount, fee, total, account } = params || {
    amount: 0,
    fee: 0,
    total: 0,
    account: {
      id: '',
      bank: 'BSI',
      accountNumber: '',
      maskedAccount: '',
      isActive: false,
    },
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  const formatDate = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log('Print transaction');
  };

  const handleHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' as never }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('withdraw.success')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.successIcon, { backgroundColor: '#10B981' }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <Text style={[styles.successMessage, { color: colors.text }]}>
          {t('withdraw.successMessage')}
        </Text>

        {/* Transaction Details */}
        <View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('withdraw.date')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('withdraw.account')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {account.maskedAccount}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('withdraw.amount')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('withdraw.fee')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(fee)}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('withdraw.totalTransaction')}
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              Rp {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.printButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handlePrint}
            activeOpacity={0.8}
          >
            <Text style={[styles.printButtonText, { color: colors.text }]}>
              {t('withdraw.print')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: colors.primary }]}
            onPress={handleHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>{t('withdraw.home')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const horizontalPadding = getHorizontalPadding();
const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(12),
  },
  backButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: minTouchTarget,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(32),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  successIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: getResponsiveFontSize('xlarge'),
    color: '#FFFFFF',
    fontFamily: FontFamily.monasans.bold,
  },
  successMessage: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(32),
  },
  detailsContainer: {
    padding: moderateScale(20),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  totalRow: {
    marginTop: moderateVerticalScale(8),
    paddingTop: moderateVerticalScale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  detailValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  totalLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  totalValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  footer: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  printButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  homeButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

