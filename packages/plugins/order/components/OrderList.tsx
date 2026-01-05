/**
 * Features Order - OrderList Component
 * Placeholder component untuk order list
 * Responsive untuk semua device termasuk tablet
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Order } from '../models/Order';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

export interface OrderListProps {
  orders: Order[];
  onOrderPress?: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onOrderPress }) => {
  const { colors } = useTheme();
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();

  return (
    <ScrollView 
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          backgroundColor: colors.background,
        },
      ]}
    >
      {orders.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Tidak ada pesanan
        </Text>
      ) : (
        orders.map(order => (
          <View
            key={order.id}
            style={[
              styles.orderItem,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onTouchEnd={() => onOrderPress?.(order)}
          >
            <Text style={[styles.orderId, { color: colors.textSecondary }]}>
              #{order.id}
            </Text>
            <Text style={[styles.orderTotal, { color: colors.text }]}>
              Rp {order.total.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.orderStatus, getStatusColor(order.status)]}>
              {order.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const getStatusColor = (status: Order['status']): { color: string } => {
  const colors: Record<Order['status'], string> = {
    pending: '#F59E0B',
    paid: '#10B981',
    cancelled: '#EF4444',
    refunded: '#6B7280',
  };
  return { color: colors[status] };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginTop: moderateVerticalScale(32),
  },
  orderItem: {
    padding: scale(16),
    borderRadius: scale(8),
    marginBottom: moderateVerticalScale(12),
  },
  orderId: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  orderTotal: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(4),
  },
  orderStatus: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    textTransform: 'uppercase',
  },
});

