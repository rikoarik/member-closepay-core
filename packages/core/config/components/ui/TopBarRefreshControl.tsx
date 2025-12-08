/**
 * TopBarRefreshControl Component
 * Custom RefreshControl dengan animasi di topbar
 * Menggunakan TopBarRefreshIndicator untuk visual feedback yang smooth
 * 
 * Usage:
 * const { pullDistance, handleScroll } = useTopBarRefresh(refreshing, handleRefresh);
 * 
 * <View>
 *   <TopBarRefreshIndicator
 *     pullDistance={pullDistance}
 *     refreshing={refreshing}
 *   />
 *   <ScrollView
 *     refreshControl={
 *       <TopBarRefreshControl
 *         refreshing={refreshing}
 *         onRefresh={handleRefresh}
 *       />
 *     }
 *     onScroll={handleScroll}
 *   />
 * </View>
 */
import React, { useRef, useCallback, useEffect } from 'react';
import { RefreshControl, RefreshControlProps, Platform } from 'react-native';
import { useTheme } from '@core/theme';
import { moderateVerticalScale } from '../../utils/responsive';
import { Animated } from 'react-native';

interface TopBarRefreshControlProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  /**
   * Apakah sedang dalam state refreshing
   */
  refreshing: boolean;
  
  /**
   * Callback ketika refresh dipicu
   */
  onRefresh: () => void;
  
  /**
   * Hide native refresh indicator (default: false)
   */
  hideNativeIndicator?: boolean;
}

/**
 * Custom RefreshControl dengan styling yang konsisten
 */
export const TopBarRefreshControl: React.FC<TopBarRefreshControlProps> = ({
  refreshing,
  onRefresh,
  hideNativeIndicator = false,
  ...refreshControlProps
}) => {
  const { colors } = useTheme();

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={hideNativeIndicator ? 'transparent' : colors.primary}
      colors={hideNativeIndicator ? ['transparent'] : [colors.primary]}
      progressViewOffset={
        hideNativeIndicator 
          ? -1000 // Hide indicator by moving it far off screen
          : Platform.OS === 'android' 
            ? moderateVerticalScale(20) 
            : 0
      }
      progressBackgroundColor={hideNativeIndicator ? 'transparent' : colors.surface}
      {...refreshControlProps}
    />
  );
};

const MAX_PULL_DISTANCE = 120;

/**
 * Hook untuk track pull distance dari ScrollView
 * Gunakan hook ini di component yang menggunakan TopBarRefreshControl
 * 
 * @param refreshing - Apakah sedang dalam state refreshing
 * @returns Object dengan pullDistance (Animated.Value), spacingHeight (Animated.Value), dan handleScroll function
 */
export const useTopBarRefresh = (
  refreshing: boolean,
  onRefresh?: () => void
) => {
  // Separate values: one for indicator animations (can use native driver) and one for spacing (non-native)
  const pullDistance = useRef(new Animated.Value(0)).current; // For indicator animations
  const spacingHeight = useRef(new Animated.Value(0)).current; // For spacing (non-native, height property)
  const scrollY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const lastPullDistance = useRef(0);

  // Helper function to calculate spacing from pull distance
  const calculateSpacing = (pull: number): number => {
    if (pull <= 0) return 0;
    if (pull >= 80) return 60; // Max 60px
    return (pull / 80) * 60; // Linear interpolation
  };

  // Reset pull distance and spacing when not refreshing
  useEffect(() => {
    if (!refreshing) {
      // Reset immediately when not refreshing
      // Use non-native driver for pullDistance since we need setValue for scroll tracking
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: false, // Non-native driver to allow setValue
          tension: 50,
          friction: 7,
        }),
        Animated.spring(spacingHeight, {
          toValue: 0,
          useNativeDriver: false, // Height requires non-native driver
          tension: 50,
          friction: 7,
        }),
      ]).start();
    } else {
      // When refreshing, maintain pull distance at threshold level
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: 80, // REFRESH_THRESHOLD
          useNativeDriver: false, // Non-native driver to allow setValue
          tension: 50,
          friction: 7,
        }),
        Animated.spring(spacingHeight, {
          toValue: 60, // Max spacing 60px
          useNativeDriver: false, // Height requires non-native driver
          tension: 50,
          friction: 7,
        }),
      ]).start();
    }
  }, [refreshing, pullDistance, spacingHeight]);

  // Handle scroll begin drag
  const handleScrollBeginDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  // Handle scroll end drag - trigger refresh if threshold reached
  const handleScrollEndDrag = useCallback(() => {
    isDragging.current = false;
    
    // If pull distance reached threshold and not already refreshing, trigger refresh
    if (!refreshing && lastPullDistance.current >= 80 && onRefresh) {
      onRefresh();
    } else if (lastPullDistance.current < 80 && !refreshing) {
      // Reset if didn't reach threshold
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(spacingHeight, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    }
  }, [refreshing, pullDistance, spacingHeight, onRefresh]);

  // Handle scroll events to track pull distance
  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(offsetY);

      // Only track pull down (negative offset) when not refreshing
      if (!refreshing && offsetY < 0) {
        const pullValue = Math.abs(offsetY);
        const clampedPull = Math.min(pullValue, MAX_PULL_DISTANCE);
        const spacing = calculateSpacing(clampedPull);
        
        lastPullDistance.current = clampedPull;
        
        // Update both values separately to avoid native driver conflicts
        pullDistance.setValue(clampedPull);
        spacingHeight.setValue(spacing);
      } else if (offsetY >= 0 && !refreshing && !isDragging.current) {
        // Reset when scrolled back up (only if not refreshing and not dragging)
        lastPullDistance.current = 0;
        Animated.parallel([
          Animated.spring(pullDistance, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(spacingHeight, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
        ]).start();
      }
    },
    [refreshing, pullDistance, spacingHeight, scrollY]
  );

  return {
    pullDistance,
    spacingHeight, // Return the separate spacingHeight value (non-native)
    handleScroll,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    scrollY,
  };
};

