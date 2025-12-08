/**
 * PullToRefreshWrapper Component
 * Custom pull-to-refresh dengan animasi visual yang menarik seperti Dribbble
 * Visual indicator yang bereaksi terhadap pull distance dengan animasi smooth
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RefreshControl } from 'react-native';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale } from '../../utils/responsive';

interface PullToRefreshWrapperProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  refreshControlProps?: any;
}

const REFRESH_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;

/**
 * Wrapper dengan custom visual indicator untuk pull-to-refresh
 * Indicator muncul dan membesar saat pull down, dengan animasi yang smooth
 */
export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  refreshing,
  onRefresh,
  children,
  refreshControlProps,
}) => {
  const { colors } = useTheme();
  const pullDistance = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Interpolate animations based on pull distance
  const circleScale = pullDistance.interpolate({
    inputRange: [0, REFRESH_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: [0.3, 1, 1.2],
    extrapolate: 'clamp',
  });

  const circleOpacity = pullDistance.interpolate({
    inputRange: [0, REFRESH_THRESHOLD * 0.5, REFRESH_THRESHOLD],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  const circleRotate = pullDistance.interpolate({
    inputRange: [0, REFRESH_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: ['0deg', '180deg', '360deg'],
    extrapolate: 'clamp',
  });

  // Handle refreshing state
  React.useEffect(() => {
    if (refreshing) {
      // Animate to refresh position
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: REFRESH_THRESHOLD,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        // Pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
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
        // Rotate animation
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
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
      ]).start();
    }
  }, [refreshing, pullDistance, scaleAnim, rotateAnim, opacityAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Clone children dan tambahkan RefreshControl dengan custom handler
  const childrenWithRefresh = React.Children.map(children, (child: any) => {
    if (React.isValidElement(child)) {
      const originalOnScroll = (child as any).props?.onScroll;
      
      const handleScroll = useCallback(
        (event: any) => {
          if (originalOnScroll) {
            originalOnScroll(event);
          }

          if (refreshing) return;

          const offsetY = event.nativeEvent.contentOffset.y;

          // Handle pull down (negative offset)
          if (offsetY < -10) {
            const pullValue = Math.abs(offsetY);
            const clampedPull = Math.min(pullValue, MAX_PULL_DISTANCE);
            pullDistance.setValue(clampedPull);
          } else {
            pullDistance.setValue(0);
          }
        },
        [refreshing, originalOnScroll, pullDistance]
      );

      return React.cloneElement(child as React.ReactElement<any>, {
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={Platform.OS === 'android' ? moderateVerticalScale(20) : 0}
            progressBackgroundColor={colors.surface}
            {...refreshControlProps}
          />
        ),
        onScroll: handleScroll,
        scrollEventThrottle: 16,
      });
    }
    return child;
  });

  // Calculate if should show indicator
  const shouldShowIndicator = refreshing || (pullDistance as any)._value > 10;

  return (
    <View style={styles.container}>
      {/* Custom Visual Indicator */}
      {shouldShowIndicator && (
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [
                { scale: Animated.add(circleScale, Animated.multiply(scaleAnim, 0.2)) },
                { rotate: refreshing ? rotate : circleRotate },
              ],
              opacity: refreshing ? opacityAnim : circleOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.circle,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <View
                style={[
                  styles.innerCircle,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
              />
            )}
          </View>
        </Animated.View>
      )}
      {childrenWithRefresh}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: moderateVerticalScale(20),
    alignSelf: 'center',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  innerCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
  },
});
