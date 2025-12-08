/**
 * QRCodeScanner Component
 * Komponen untuk menampilkan QR code scanner dengan scan line animation
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { scale } from '../../../utils/responsive';
import { QR_CODE_SVG } from '../../onboarding/assets';
import type { ScreenContentStyles } from '../styles';

interface QRCodeScannerProps {
  colors: {
    primary: string;
  };
  styles: ScreenContentStyles;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ colors, styles: screenStyles }) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [scanLineAnim]);

  return (
    <View style={screenStyles.cameraScreen}>
      <Text style={screenStyles.cameraHint}>Arahkan ke QR</Text>
      <View style={[screenStyles.qrFrame, { borderColor: colors.primary }]}>
        <View style={screenStyles.qrCodeContainer}>
          <SvgXml xml={QR_CODE_SVG} width="100%" height="100%" />
          {/* Scanning Line Animation */}
          <Animated.View
            style={[
              screenStyles.scanLine,
              {
                backgroundColor: colors.primary,
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, scale(156)],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

