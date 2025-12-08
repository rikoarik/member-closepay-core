/**
 * NewsItemSkeleton Component
 * Shimmer loading untuk NewsItem
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
} from '@core/config';

export const NewsItemSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const ShimmerBox = ({ style }: { style: any }) => (
    <View style={[style, { backgroundColor: colors.surfaceSecondary, overflow: 'hidden', borderRadius: style.borderRadius || scale(4) }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surface,
            opacity,
            transform: [{ translateX }],
            width: '50%',
          },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Image Skeleton */}
      <ShimmerBox style={styles.imageSkeleton} />

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Title Skeleton */}
        <ShimmerBox style={styles.titleSkeleton} />

        {/* Description Skeleton - Line 1 */}
        <ShimmerBox style={styles.descriptionSkeleton} />

        {/* Description Skeleton - Line 2 */}
        <ShimmerBox style={styles.descriptionSkeleton2} />

        {/* Date Skeleton */}
        <ShimmerBox style={styles.dateSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  imageSkeleton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  content: {
    flex: 1,
  },
  titleSkeleton: {
    width: '80%',
    height: getResponsiveFontSize('medium') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  descriptionSkeleton: {
    width: '100%',
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(2),
  },
  descriptionSkeleton2: {
    width: '90%',
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  dateSkeleton: {
    width: scale(120),
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
  },
});

