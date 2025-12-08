/**
 * SectionHeader Component
 * Header dengan title dan detail link
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  scale,
  moderateScale,
  getResponsiveFontSize,
  FontFamily,
  DetailArrowIcon,
} from '@core/config';
import { useTheme } from '@core/theme';

interface SectionHeaderProps {
  title: string;
  showDetailLink?: boolean;
  detailLabel?: string;
  onDetailPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showDetailLink = false,
  detailLabel,
  onDetailPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      {showDetailLink && (
        <TouchableOpacity onPress={onDetailPress}>
          <View style={styles.detailLinkContainer}>
            <Text style={[styles.detailLink, { color: colors.primary }]}>
              {detailLabel}
            </Text>
            <DetailArrowIcon size="small" color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  detailLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  detailLink: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});


