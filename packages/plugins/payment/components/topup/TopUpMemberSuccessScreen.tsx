/**
 * Top Up Member Success Screen
 * Screen untuk menampilkan hasil sukses top up saldo member
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, TickCircle } from 'iconsax-react-nativejs';
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

interface RouteParams {
  tabType: 'id-member' | 'excel' | 'top-kartu';
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  memberId?: string;
  memberName: string;
  adminFee: number;
  totalAmount: number;
  pin?: string;
  isExcelFlow?: boolean;
  email?: string;
}

export const TopUpMemberSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;

  const {
    tabType,
    balanceTargetName,
    amount,
    memberId,
    memberName,
    adminFee,
    totalAmount,
    isExcelFlow,
    email,
  } = params || {
    tabType: 'id-member',
    balanceTarget: '',
    balanceTargetName: t('topUp.balanceTargetDefault'),
    amount: 0,
    memberId: '',
    memberName: 'Riko S',
    adminFee: 0,
    totalAmount: 0,
    isExcelFlow: false,
    email: '',
  };

  const displayMemberId = memberId || '1123123';

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  const formatDateTime = (): string => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log('Print transaction');
  };

  const handleDone = () => {
    // Navigate back to home or previous screen
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('common.success')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.successIcon, { backgroundColor: '#10B981' }]}>
            <TickCircle size={scale(40)} color="#FFFFFF" variant="Bold" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={[styles.successMessage, { color: colors.text }]}>
          {t('topUp.transactionSuccess')}
        </Text>

        {/* Excel Flow - Email Notification */}
        {isExcelFlow && (
          <View
            style={[
              styles.emailNotification,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.emailNotificationText, { color: colors.text }]}>
              {t('topUp.emailNotificationMessage', { email: email || 'Ilhamnabibaru@gmail.com' })}
            </Text>
          </View>
        )}

        {/* Transaction Details - Only for non-Excel flow */}
        {!isExcelFlow && (
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
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDateTime()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.transactionType')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{t('home.topUp')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('profile.name')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{memberName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.memberId')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{displayMemberId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.balanceTarget')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {balanceTargetName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.subtotal')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.adminFee')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(adminFee)}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('topUp.totalAmount')}
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              Rp {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
      >
        {isExcelFlow ? (
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>{t('common.done')}</Text>
          </TouchableOpacity>
        ) : (
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
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(32),
    paddingBottom: moderateVerticalScale(24),
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
    flex: 1,
  },
  detailValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  totalValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'right',
  },
  emailNotification: {
    padding: moderateScale(20),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  emailNotificationText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    lineHeight: moderateVerticalScale(24),
  },
  footer: {
    borderTopWidth: 1,
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
    minHeight: minTouchTarget,
  },
  printButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  doneButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  doneButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

