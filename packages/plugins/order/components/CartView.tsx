/**
 * Features Order - CartView Component
 * Placeholder component untuk cart view
 * Responsive untuk semua device termasuk tablet
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Cart } from '../models/Cart';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

export interface CartViewProps {
  cart: Cart;
  onCheckout?: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, onCheckout }) => {
  const { colors } = useTheme();
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();

  return (
    <View 
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView>
        <Text style={[styles.title, { color: colors.text }]}>Keranjang</Text>
        {cart.items.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Keranjang kosong
          </Text>
        ) : (
          <>
            {cart.items.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.item,
                  {
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.productName}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  x{item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </Text>
              </View>
            ))}
            <View 
              style={[
                styles.totalContainer,
                {
                  borderTopColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                Rp {cart.total.toLocaleString('id-ID')}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
  },
  emptyText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginTop: moderateVerticalScale(32),
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemName: {
    flex: 1,
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.regular,
  },
  itemQuantity: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginHorizontal: scale(8),
  },
  itemPrice: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateVerticalScale(16),
    paddingTop: moderateVerticalScale(16),
    borderTopWidth: scale(2),
  },
  totalLabel: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  totalAmount: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});

