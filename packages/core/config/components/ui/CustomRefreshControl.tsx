/**
 * CustomRefreshControl Component
 * Custom pull-to-refresh dengan animasi visual yang menarik seperti Dribbble
 * Menggunakan Animated API untuk smooth animation dengan visual feedback
 */
import React from 'react';
import { RefreshControl, RefreshControlProps, Platform } from 'react-native';
import { useTheme } from '@core/theme';
import { moderateVerticalScale } from '../../utils/responsive';

interface CustomRefreshControlProps extends RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * Custom RefreshControl dengan animasi visual yang menarik
 * Menggunakan native RefreshControl dengan custom styling
 * Menambahkan visual feedback yang lebih baik
 */
export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  ...props
}) => {
  const { colors } = useTheme();
  
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressViewOffset={Platform.OS === 'android' ? moderateVerticalScale(20) : 0}
      progressBackgroundColor={colors.surface}
      {...props}
    />
  );
};
