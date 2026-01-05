/* eslint-disable react/no-unstable-nested-components */
/**
 * Transaction History Screen Component
 * Screen untuk menampilkan riwayat transaksi
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useBalance, TransactionType, BalanceMutation } from '../index';
import {
  ArrowLeft2,
} from 'iconsax-react-nativejs';
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

const mockMutations: BalanceMutation[] = [
  {
    id: '1',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '2',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '3',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '4',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '5',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '6',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
  {
    id: '7',
    accountId: 'acc1',
    type: TransactionType.WITHDRAW,
    amount: -197000,
    balance: 0,
    description: 'Transfer ke Bank',
    createdAt: new Date('2020-08-25T10:28:00'),
  },
];

export const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mutations, loadMutations, refresh } = useBalance();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const months = [
    t('balance.months.january'),
    t('balance.months.february'),
    t('balance.months.march'),
    t('balance.months.april'),
    t('balance.months.may'),
    t('balance.months.june'),
    t('balance.months.july'),
    t('balance.months.august'),
    t('balance.months.september'),
    t('balance.months.october'),
    t('balance.months.november'),
    t('balance.months.december'),
  ];

  React.useEffect(() => {
    loadMutations();
  }, [selectedMonth, selectedYear, loadMutations]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadMutations();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, loadMutations]);

  const formatTransactionDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };



  // Filter mutations by selected month and year
  const filteredMutations = useMemo(() => {
    const allMutations = mutations.length > 0 ? mutations : mockMutations;
    return allMutations.filter((mutation) => {
      const mutationDate = new Date(mutation.createdAt);
      return (
        mutationDate.getMonth() === selectedMonth &&
        mutationDate.getFullYear() === selectedYear
      );
    });
  }, [mutations, selectedMonth, selectedYear]);

  const formatAmount = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : ''}Rp ${formatted}`;
  };

  const renderTransactionItem = ({ item }: { item: BalanceMutation }) => (
    <View
      style={[
        styles.transactionItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]}>
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatTransactionDate(new Date(item.createdAt))}
        </Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.amount < 0 ? colors.error || '#EF4444' : colors.success || colors.primary }
      ]}>
        {formatAmount(item.amount)}
      </Text>
    </View>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.header,
        {
          backgroundColor: colors.background,
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('balance.transactionHistory')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Month Filter Pills */}
      <View style={[styles.monthFilterContainer, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthFilterScroll}
        >
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.monthPill,
                {
                  backgroundColor: selectedMonth === index ? colors.primary : colors.surface,
                  borderColor: selectedMonth === index ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setSelectedMonth(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.monthPillText,
                  {
                    color: selectedMonth === index ? '#FFFFFF' : colors.text,
                    fontFamily: selectedMonth === index ? FontFamily.monasans.semiBold : FontFamily.monasans.regular,
                  }
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transaction List */}
      {filteredMutations.length === 0 ? (
        <View style={[styles.emptyState, { paddingTop: moderateVerticalScale(40) }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            {t('balance.noTransactions')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMutations}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          style={styles.transactionList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: scale(12) }} />}
        />
      )}
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
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: minTouchTarget,
  },
  listContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(24),
  },
  monthFilterContainer: {
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  monthFilterScroll: {
    paddingHorizontal: horizontalPadding,
    gap: scale(8),
  },
  monthPill: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  monthPillText: {
    fontSize: getResponsiveFontSize('small'),
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  transactionContent: {
    flex: 1,
    marginRight: scale(12),
  },
  transactionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  transactionDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  emptyState: {
    paddingVertical: moderateVerticalScale(32),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
});

