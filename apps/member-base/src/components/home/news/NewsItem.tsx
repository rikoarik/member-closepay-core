/**
 * NewsItem Component
 * Item individual dalam news list
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

export interface News {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
}

interface NewsItemProps {
  news: News;
  onPress?: (news: News) => void;
}

const NewsItemComponent: React.FC<NewsItemProps> = ({ news, onPress }) => {
  const { colors } = useTheme();

  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    title: {
      color: colors.text,
    },
    description: {
      color: colors.textSecondary,
    },
    date: {
      color: colors.textTertiary || colors.textSecondary,
    },
  }), [colors]);

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container]}
      onPress={() => onPress?.(news)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: news.imageUrl || 'https://picsum.photos/200/200' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>
          {news.title}
        </Text>
        <Text style={[styles.description, dynamicStyles.description]} numberOfLines={2}>
          {news.description}
        </Text>
        <Text style={[styles.date, dynamicStyles.date]}>
          {news.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const NewsItem = React.memo(NewsItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  image: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  description: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  date: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
});


