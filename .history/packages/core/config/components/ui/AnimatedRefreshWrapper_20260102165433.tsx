import React, { useRef, useCallback, useEffect, Children, isValidElement } from 'react';
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  ScrollViewProps,
} from 'react-native';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale } from '../../utils/responsive';
import { Refresh2 } from 'iconsax-react-nativejs';

interface AnimatedRefreshWrapperProps extends Omit<ScrollViewProps, 'onScroll'> {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  scrollY?: Animated.Value;
}

const PULL_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 140;
const CONTENT_OFFSET_RATIO = 0.4;

export const AnimatedRefreshWrapper: React.FC<AnimatedRefreshWrapperProps> = ({
  refreshing,
  onRefresh,
  children,
  scrollY = new Animated.Value(0),
  ...scrollViewProps
}) => {
  const { colors } = useTheme();
  const pullDistance = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hasTriggered = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      if (offsetY < 0 && !refreshing) {
        const pullAmount = Math.min(Math.abs(offsetY), MAX_PULL_DISTANCE);
        const normalized = Math.min(pullAmount / PULL_THRESHOLD, 1.5);

        Animated.parallel([
          Animated.spring(pullDistance, {
            toValue: pullAmount,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(rotation, {
            toValue: normalized,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 0.6 + normalized * 0.4,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: Math.min(normalized, 1),
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        if (pullAmount >= PULL_THRESHOLD && !hasTriggered.current) {
          hasTriggered.current = true;
          onRefresh();
        }
      } else if (offsetY >= 0 && !refreshing) {
        hasTriggered.current = false;
        Animated.parallel([
          Animated.spring(pullDistance, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 0.6,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }

      (scrollViewProps as any).onScroll?.(event);
    },
    [refreshing, onRefresh, pullDistance, rotation, scale, opacity, scrollViewProps]
  );

  useEffect(() => {
    if (refreshing) {
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: PULL_THRESHOLD,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotation, {
            toValue: 2,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      rotation.stopAnimation();
      Animated.parallel([
        Animated.spring(pullDistance, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.6,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [refreshing, pullDistance, rotation, scale, opacity]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  const indicatorTranslateY = pullDistance.interpolate({
    inputRange: [0, PULL_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: [-PULL_THRESHOLD + 20, 20, 40],
    extrapolate: 'clamp',
  });

  const contentTranslateY = pullDistance.interpolate({
    inputRange: [0, PULL_THRESHOLD, MAX_PULL_DISTANCE],
    outputRange: [0, PULL_THRESHOLD * CONTENT_OFFSET_RATIO, PULL_THRESHOLD * CONTENT_OFFSET_RATIO],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            transform: [{ translateY: indicatorTranslateY }],
            opacity,
          },
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: rotateInterpolate }, { scale }],
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Refresh2 size={Scale(20)} color={colors.surface} variant="Bold" />
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            listener: handleScroll,
            useNativeDriver: false,
          }
        )}
        bounces={true}
        alwaysBounceVertical={true}
        showsVerticalScrollIndicator={scrollViewProps.showsVerticalScrollIndicator ?? false}
        {...scrollViewProps}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? moderateVerticalScale(10) : moderateVerticalScale(20),
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
});

