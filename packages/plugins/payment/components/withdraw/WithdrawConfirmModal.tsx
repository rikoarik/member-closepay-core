/**
 * Withdraw Confirm Modal
 * Modal untuk konfirmasi penarikan dana
 * Menggunakan reusable BottomSheet component dari @core/config
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { BottomSheet } from '@core/config';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
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

interface WithdrawConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  fee: number;
  total: number;
  account: BankAccount;
}

export const WithdrawConfirmModal: React.FC<WithdrawConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  amount,
  fee,
  total,
  account,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[80]}
      initialSnapPoint={0}
      enablePanDownToClose={true}
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
            {t('withdraw.confirmTitle')}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
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

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
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
    width: scale(40),
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
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

