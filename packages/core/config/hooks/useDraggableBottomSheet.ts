import { useEffect, useRef } from "react"
import { Animated, Dimensions, PanResponder } from "react-native"

/**
 * Hook untuk membuat draggable bottom sheet dengan snap points
 * @param  snapPoints Array berisi nilai 0–1 yang merepresentasikan persentase tinggi layar.
 *                   Contoh: [0.64, 0.96]
 * @returns { height, panResponder }
 *  - height: Animated.Value untuk di-bind ke style.height pada container bottom sheet
 *  - panResponder: panHandlers untuk area drag handle
 */
export const useDraggableBottomSheet = (snapPoints: number[]) => {
  const screenHeight = Dimensions.get('window').height;
  const snapPointsRef = useRef(snapPoints);
  
  // Update ref when snapPoints change
  useEffect(() => {
    snapPointsRef.current = snapPoints;
  }, [snapPoints]);

  const initialHeight = screenHeight * snapPoints[0];
  const height = useRef(new Animated.Value(initialHeight)).current;
  const currentHeight = useRef(initialHeight);
  const currentSnapIndex = useRef(0);

  // React to snapPoints[0] changes to update position dynamically
  useEffect(() => {
    const newInitialHeight = screenHeight * snapPoints[0];
    if (Math.abs(currentHeight.current - newInitialHeight) > 10) {
       // Only animate if the difference is significant and we are at the first snap point
       if (currentSnapIndex.current === 0) {
          currentHeight.current = newInitialHeight;
          Animated.spring(height, {
            toValue: newInitialHeight,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapPoints, screenHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 3;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        height.stopAnimation((value) => {
          currentHeight.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const points = snapPointsRef.current;
        const newHeight = currentHeight.current - gestureState.dy;
        const minHeight = screenHeight * points[0];
        const maxHeight = screenHeight * points[points.length - 1];
        const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        height.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const points = snapPointsRef.current;
        const velocity = gestureState.vy;
        const finalHeight = currentHeight.current - gestureState.dy;
        const currentHeightPercent = finalHeight / screenHeight;

        let nearestIndex = 0;
        let minDistance = Math.abs(currentHeightPercent - points[0]);

        points.forEach((point, index) => {
          const distance = Math.abs(currentHeightPercent - point);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });

        if (Math.abs(velocity) > 0.3) {
          if (velocity < -0.3 && currentSnapIndex.current < points.length - 1) {
            nearestIndex = Math.min(currentSnapIndex.current + 1, points.length - 1);
          } else if (velocity > 0.3 && currentSnapIndex.current > 0) {
            nearestIndex = Math.max(currentSnapIndex.current - 1, 0);
          }
        }

        currentSnapIndex.current = nearestIndex;
        const targetHeight = screenHeight * points[nearestIndex];
        currentHeight.current = targetHeight;

        Animated.spring(height, {
          toValue: targetHeight,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  return { height, panResponder };
};


