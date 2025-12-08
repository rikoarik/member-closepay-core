/**
 * AktivitasTab Component
 * Tab aktivitas dengan menu, banner, dan saldo
 * Tidak bisa di-scroll karena kontennya tidak panjang
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';

interface AktivitasTabProps {
  isActive?: boolean;
  isVisible?: boolean; // Add prop to know if tab is visible (for lifecycle)
}

export const AktivitasTab: React.FC<AktivitasTabProps> = React.memo(({
  isActive = true,
  isVisible = true,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      {/* Konten kosong */}
    </View>
  );
});

AktivitasTab.displayName = 'AktivitasTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

