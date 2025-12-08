/**
 * TopBarRefreshIndicator Component
 * Custom refresh indicator dengan animasi smooth yang muncul di area topbar
 * Bereaksi terhadap pull distance dengan scale, opacity, rotation, dan progress animations
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale } from '../../utils/responsive';

interface TopBarRefreshIndicatorProps {
  /**
   * Pull distance sebagai Animated.Value (0-120)
   * 0 = tidak ada pull
   * 50 = mulai muncul
   * 80 = threshold untuk trigger refresh
   * 120 = max pull distance
   */
  pullDistance: Animated.Value;
  
  /**
   * Apakah sedang dalam state refreshing
   */
  refreshing: boolean;
}

const REFRESH_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;
const MIN_PULL_DISTANCE = 50;

export const TopBarRefreshIndicator: React.FC<TopBarRefreshIndicatorProps> = ({
  pullDistance,
  refreshing,
}) => {
  const { colors } = useTheme();
  
  // Animated values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Interpolate scale based on pull distance
  const scale = pullDistance.interpolate({
    inputRange: [0, MIN_PULL_DISTANCE, REFRESH_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: [0.3, 0.6, 1, 1.1],
    extrapolate: 'clamp',
  });

  // Interpolate opacity based on pull distance
  const opacity = pullDistance.interpolate({
    inputRange: [0, MIN_PULL_DISTANCE * 0.5, MIN_PULL_DISTANCE, REFRESH_THRESHOLD],
    outputRange: [0, 0.3, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Interpolate rotation based on pull distance (before refresh)
  const rotation = pullDistance.interpolate({
    inputRange: [0, REFRESH_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: ['0deg', '180deg', '360deg'],
    extrapolate: 'clamp',
  });

  // Progress circle (0-1) based on pull distance
  const progress = pullDistance.interpolate({
    inputRange: [0, REFRESH_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Handle refreshing state animations
  useEffect(() => {
    if (refreshing) {
      // Start continuous rotation and pulse animations
      Animated.parallel([
        // Continuous rotation
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
        // Pulse effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ),
        // Full opacity
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Full progress
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false, // Progress uses non-native driver
        }),
      ]).start();
    } else {
      // Reset animations when not refreshing
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [refreshing, scaleAnim, rotateAnim, opacityAnim, progressAnim]);

  // Rotation for refreshing state
  const refreshingRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Combined scale (pull distance + pulse when refreshing)
  const combinedScale = refreshing
    ? Animated.multiply(scale, Animated.add(1, Animated.multiply(scaleAnim, 0.15)))
    : scale;

  // Combined opacity
  const combinedOpacity = refreshing ? opacityAnim : opacity;

  // Combined rotation
  const combinedRotation = refreshing ? refreshingRotation : rotation;

  // We'll always render but control visibility with opacity

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: combinedOpacity,
          transform: [
            { scale: combinedScale },
            { rotate: combinedRotation },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.circle, { backgroundColor: colors.primary }]}>
        {refreshing ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <Animated.View
            style={[
              styles.progressCircle,
              {
                borderColor: colors.surface,
                borderWidth: 2,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.surface,
                  transform: [
                    {
                      scale: progress,
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
  },
});

