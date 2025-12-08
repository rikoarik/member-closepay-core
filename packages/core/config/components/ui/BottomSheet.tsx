/**
 * BottomSheet Component
 * Reusable bottom sheet dengan drag gesture untuk membuka/menutup
 */
import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';  
import {
  scale,
  moderateVerticalScale,
} from '../../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage dari screen height, default [25, 75]
  initialSnapPoint?: number; // Index dari snapPoints, default 0
  enablePanDownToClose?: boolean;
  disableClose?: boolean; // Disable close saat ada modal lain terbuka (seperti date picker)
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [25, 75],
  initialSnapPoint = 0,
  enablePanDownToClose = true,
  disableClose = false,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Convert snap points dari percentage ke pixel
  // 0% = full screen (translateY = 0), 100% = hidden (translateY = SCREEN_HEIGHT)
  // point = percentage dari screen height yang ditampilkan (75 = 75% dari screen height)
  const snapPointsInPixels = snapPoints.map(
    (point) => {
      // Clamp point antara 0-100
      const clampedPoint = Math.max(0, Math.min(100, point));
      // Jika point = 75, berarti kita ingin menampilkan 75% dari screen height
      // translateY = SCREEN_HEIGHT * (100 - point) / 100
      // Contoh: point = 75, translateY = SCREEN_HEIGHT * 0.25 (menampilkan 75% dari bawah)
      return SCREEN_HEIGHT * (100 - clampedPoint) / 100;
    }
  );
  const initialPosition = snapPointsInPixels[initialSnapPoint] || snapPointsInPixels[0];

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: initialPosition,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialPosition, translateY, opacity]);

  const startY = useRef(0);
  const currentY = useRef(initialPosition);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disableClose && enablePanDownToClose,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (disableClose || !enablePanDownToClose) return false;
          return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          if (disableClose) return;
          translateY.stopAnimation((value) => {
            startY.current = value;
            currentY.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          if (disableClose) return;
          const newY = startY.current + gestureState.dy;
          // Allow dragging from 0 (full screen) to SCREEN_HEIGHT (hidden)
          // Smaller translateY = higher on screen
          if (newY >= 0 && newY <= SCREEN_HEIGHT) {
            currentY.current = newY;
            translateY.setValue(newY);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (disableClose) {
            // If disabled, just snap back to current position
            Animated.spring(translateY, {
              toValue: currentY.current,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
            return;
          }

          const velocity = gestureState.vy;
          const currentYValue = currentY.current;

          // Find nearest snap point
          let targetSnap = snapPointsInPixels[0];
          let minDistance = Math.abs(currentYValue - snapPointsInPixels[0]);

          for (const snap of snapPointsInPixels) {
            const distance = Math.abs(currentYValue - snap);
            if (distance < minDistance) {
              minDistance = distance;
              targetSnap = snap;
            }
          }

          // If dragging down with velocity or past threshold, close
          if (enablePanDownToClose && (velocity > 0.5 || currentYValue > SCREEN_HEIGHT * 0.9)) {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: SCREEN_HEIGHT,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onClose();
            });
          } else {
            Animated.spring(translateY, {
              toValue: targetSnap,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }
        },
      }),
    [disableClose, enablePanDownToClose, onClose, translateY, opacity, snapPointsInPixels]
  );

  const animatedSheetStyle = {
    transform: [{ translateY }],
  };

  const animatedBackdropStyle = {
    opacity,
  };

  const handleBackdropPress = useCallback(() => {
    if (enablePanDownToClose && !disableClose) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }
  }, [enablePanDownToClose, disableClose, onClose, translateY, opacity]);

  if (!visible) {
    return null;
  }

  return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={disableClose ? undefined : onClose}
        statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom + moderateVerticalScale(16),
            },
            animatedSheetStyle,
          ]}
          pointerEvents={disableClose ? 'box-none' : 'auto'}
          {...panResponder.panHandlers}>
          {/* Drag Handle */}
          {enablePanDownToClose && !disableClose && (
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            </View>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SCREEN_HEIGHT,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: moderateVerticalScale(12),
    paddingBottom: moderateVerticalScale(8),
  },
  dragHandle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
});

