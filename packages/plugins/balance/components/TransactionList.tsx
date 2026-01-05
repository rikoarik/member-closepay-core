/**
 * TransactionList Component
 * List transaksi dengan FlatList untuk virtualized rendering
 */
import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from './TransactionItem';

// Re-export Transaction type for convenience
export type { Transaction };

interface TransactionListProps {
  transactions: Transaction[];
}

// Separator component untuk gap antar items
const ItemSeparator = () => <View style={styles.separator} />;

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  // Memoized render function untuk performa optimal
  const renderItem: ListRenderItem<Transaction> = useCallback(
    ({ item }) => <TransactionItem transaction={item} />,
    []
  );

  // Memoized keyExtractor
  const keyExtractor = useCallback(
    (item: Transaction, index: number) => item.id || `transaction-${index}`,
    []
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={styles.contentContainer}
      // Performance optimizations untuk EDC/low-spec devices
      removeClippedSubviews={true} // Remove views yang tidak visible dari memory
      maxToRenderPerBatch={10} // Render 10 items per batch
      windowSize={10} // Keep 10 screens worth of items in memory
      initialNumToRender={10} // Render 10 items pada load pertama
      updateCellsBatchingPeriod={50} // Batch updates setiap 50ms
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    height: scale(12),
  },
  contentContainer: {
    paddingBottom: moderateVerticalScale(16),
  },
});

