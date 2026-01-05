/**
 * TransactionItem Component (OPTIMIZED for low-spec devices)
 * Item individual dalam transaction list
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getIconSize,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

export interface Transaction {
  id?: string;
  type: 'topup' | 'withdrawal';
  amount: number;
  date: string;
  title?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
}

// Pre-calculate icon size outside component to avoid recalculation
const ICON_SIZE = getIconSize('medium');

const TransactionItemComponent: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { colors } = useTheme();
  
  // Memoize computed values to avoid recalculating on every render
  const title = useMemo(() => {
    return transaction.title || 
           (transaction.type === 'topup' ? 'Isi Saldo Berhasil' : 'Pencairan Berhasil');
  }, [transaction.title, transaction.type]);

  const amountColor = useMemo(() => {
    return transaction.type === 'topup' 
      ? (colors.success || '#10B981') 
      : (colors.error || '#EF4444');
  }, [transaction.type, colors.success, colors.error]);

  const formattedAmount = useMemo(() => {
    const prefix = transaction.type === 'topup' ? '+' : '-';
    return `${prefix}Rp ${transaction.amount.toLocaleString('id-ID')}`;
  }, [transaction.amount, transaction.type]);

  // Create dynamic styles only when colors change
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    icon: {
      backgroundColor: colors.surfaceSecondary,
    },
    title: {
      color: colors.text,
    },
    date: {
      color: colors.textSecondary,
    },
    amount: {
      color: amountColor,
    },
  }), [colors, amountColor]);

  return (
    <View style={[styles.transactionItem, dynamicStyles.container]}>
      <View style={[styles.transactionIcon, dynamicStyles.icon]}>
        <ArrowDown2
          size={ICON_SIZE}
          color={colors.textSecondary}
          variant="Bulk"
        />
      </View>
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.transactionTitle, dynamicStyles.title]}>
            {title}
          </Text>
          <Text style={[styles.transactionAmount, dynamicStyles.amount]}>
            {formattedAmount}
          </Text>
        </View>
        <Text style={[styles.transactionDate, dynamicStyles.date]}>
          {transaction.date}
        </Text>
      </View>
    </View>
  );
};

export const TransactionItem = React.memo(TransactionItemComponent);

TransactionItem.displayName = 'TransactionItem';

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(10),
    paddingHorizontal: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  transactionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(4),
  },
  transactionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
    marginRight: scale(8),
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  transactionDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});

