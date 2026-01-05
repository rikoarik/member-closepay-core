/**
 * Top Up Member Summary Bottom Sheet
 * Bottom sheet untuk menampilkan ringkasan transaksi top up saldo member
 * Responsive untuk semua device termasuk EDC
 * Menggunakan reusable BottomSheet component dari @core/config
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { BottomSheet, moderateScale } from '@core/config';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';

export interface TopUpMemberSummaryData {
  tabType: 'id-member' | 'excel' | 'top-kartu';
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  memberId?: string;
  memberName?: string;
}

interface TopUpMemberSummaryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  data: TopUpMemberSummaryData | null;
  onConfirm: (data: TopUpMemberSummaryData & { adminFee: number; totalAmount: number }) => void;
}

export const TopUpMemberSummaryBottomSheet: React.FC<TopUpMemberSummaryBottomSheetProps> = ({
  visible,
  onClose,
  data,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Helper functions
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

  const handleConfirm = () => {
    if (!data) {
      console.error('Cannot confirm: no data');
      return;
    }
    onConfirm({
      ...data,
      memberName: data.memberName || 'Riko S',
      adminFee: Math.round(data.amount * 0.1),
      totalAmount: data.amount - Math.round(data.amount * 0.1),
    });
  };

  // Extract data
  const { balanceTargetName, amount, memberId } = data || {};

  // Mock data - akan diganti dengan data dari API
  const memberName = data?.memberName || 'Riko S';
  const displayMemberId = memberId || '1123123';
  const adminFee = data ? Math.round(data.amount * 0.1) : 0; // 10% admin fee
  const totalAmount = data ? data.amount - adminFee : 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[100]}
      initialSnapPoint={0}
      enablePanDownToClose={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft2
              size={getIconSize('medium')}
              color={colors.text}
              variant="Outline"
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('analytics.summary')}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        {!data ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {t('topUp.noData')}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('withdraw.date')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime()}
              </Text>
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
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {displayMemberId}
              </Text>
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
                {t('topUp.totalAmount')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                Rp {formatCurrency(amount || 0)}
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
                {t('topUp.totalTransaction')}
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                Rp {formatCurrency(totalAmount)}
              </Text>
            </View>
          </ScrollView>
        )}

        {/* Footer */}
        {data && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
  },
  backButton: {
    padding: moderateVerticalScale(8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: moderateScale(40),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginBottom: moderateVerticalScale(24),
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
    marginTop: moderateVerticalScale(16),
  },
  confirmButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  emptyState: {
    padding: moderateVerticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
});

