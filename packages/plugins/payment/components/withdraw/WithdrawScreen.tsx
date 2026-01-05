/**
 * Withdraw Screen
 * Screen untuk pencairan dana dengan keypad input
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useBalance } from '@core/config/plugins/contracts';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';
import { WithdrawConfirmModal } from './WithdrawConfirmModal';
import { AutoWithdrawModal } from './AutoWithdrawModal';

interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  maskedAccount: string;
  isActive: boolean;
}

const MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: '1',
    bank: 'BSI',
    accountNumber: '1234567890',
    maskedAccount: 'BSI/***1468/AFI*****',
    isActive: true,
  },
];

export const WithdrawScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { balance } = useBalance();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount>(MOCK_ACCOUNTS[0]);
  const [autoWithdrawEnabled, setAutoWithdrawEnabled] = useState(false);
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAutoWithdrawModal, setShowAutoWithdrawModal] = useState(false);

  const balanceAmount = balance?.balance || 1000000;
  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const withdrawFee = Math.max(3000, Math.round(numericAmount * 0.015)); // Rp 3.000 atau 1.5%
  const totalAmount = numericAmount + withdrawFee;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  const formatCurrencyInput = (value: string): string => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    // Format with thousand separators
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters
    const numeric = text.replace(/\D/g, '');
    
    // Limit to balance amount
    const numValue = parseInt(numeric, 10);
    if (numeric && numValue > balanceAmount) {
      setAmount(balanceAmount.toString());
      return;
    }
    
    // Store numeric value only (without formatting)
    setAmount(numeric);
  };

  const handleWithdrawAll = () => {
    setWithdrawAll(!withdrawAll);
    if (!withdrawAll) {
      setAmount(balanceAmount.toString());
    } else {
      setAmount('');
    }
  };

  const displayAmount = amount ? formatCurrencyInput(amount) : '';

  const handleNext = () => {
    if (numericAmount <= 0 || numericAmount > balanceAmount) return;
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    // Navigate to success screen
    // @ts-ignore
    navigation.navigate('WithdrawSuccess', {
      amount: numericAmount,
      fee: withdrawFee,
      total: numericAmount - withdrawFee,
      account: selectedAccount,
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
          {t('withdraw.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Automatic Withdrawal Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              {t('withdraw.autoWithdraw')}
            </Text>
            <Switch
              value={autoWithdrawEnabled}
              onValueChange={(value) => {
                setAutoWithdrawEnabled(value);
                if (value) {
                  setShowAutoWithdrawModal(true);
                }
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : undefined}
            />
          </View>
        </View>

        {/* Account Selection */}
        <View style={styles.section}>
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.accountInfo}>
              <Text style={[styles.accountNumber, { color: colors.text }]}>
                {selectedAccount.maskedAccount}
              </Text>
              {selectedAccount.isActive && (
                <View style={[styles.activeBadge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.activeBadgeText}>{t('withdraw.used')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('withdraw.amount')}
          </Text>
          <View
            style={[
              styles.amountContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={displayAmount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          {/* Withdraw All Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={handleWithdrawAll}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: withdrawAll ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
            >
              {withdrawAll && (
                <Text style={styles.checkboxCheckmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              {t('withdraw.withdrawAll')} (Rp {formatCurrency(balanceAmount)})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fee Information */}
        <View style={styles.section}>
          <View style={styles.feeRow}>
            <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>
              {t('withdraw.fee')}
            </Text>
            <Text style={[styles.feeValue, { color: colors.text }]}>
              Rp {formatCurrency(withdrawFee)} / 1.5%
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + moderateVerticalScale(16),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  numericAmount > 0 && numericAmount <= balanceAmount
                    ? colors.primary
                    : colors.border,
                opacity: numericAmount > 0 && numericAmount <= balanceAmount ? 1 : 0.5,
              },
            ]}
            onPress={handleNext}
            disabled={numericAmount <= 0 || numericAmount > balanceAmount}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>{t('common.confirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <WithdrawConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        amount={numericAmount}
        fee={withdrawFee}
        total={numericAmount - withdrawFee}
        account={selectedAccount}
      />

      <AutoWithdrawModal
        visible={showAutoWithdrawModal}
        onClose={() => {
          setShowAutoWithdrawModal(false);
          setAutoWithdrawEnabled(false);
        }}
        onSave={(enabled) => {
          setAutoWithdrawEnabled(enabled);
          setShowAutoWithdrawModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const horizontalPadding = getHorizontalPadding();
const verticalPadding = getVerticalPadding();
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
  },
  section: {
    marginBottom: moderateVerticalScale(20),
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  accountCard: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountNumber: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  activeBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  activeBadgeText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(20),
    borderRadius: scale(12),
    borderWidth: 1,
    gap: scale(8),
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'right',
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateVerticalScale(12),
    gap: scale(12),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(4),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  checkboxLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  feeValue: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

