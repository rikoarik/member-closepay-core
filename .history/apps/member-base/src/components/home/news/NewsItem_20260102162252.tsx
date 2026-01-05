import React, { useState } from 'react';
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

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/56x56/CCCCCC/FFFFFF?text=News';

const NewsItemComponent: React.FC<NewsItemProps> = ({ news, onPress }) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress?.(news)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageError ? PLACEHOLDER_IMAGE : (news.imageUrl || PLACEHOLDER_IMAGE) }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {news.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {news.description}
        </Text>
        <Text
          style={[styles.date, { color: colors.textTertiary || colors.textSecondary }]}
        >
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


